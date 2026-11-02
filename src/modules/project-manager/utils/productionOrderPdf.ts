import { jsPDF } from "jspdf";
import { loadBase64Image, extractProjectImageMeta } from "@/lib/pdfHelper";
import { formatDate as formatStandardDate } from "@/lib/formatDate";
import {
  getOrderProjectsAssignments,
  getPMOrderById,
  UserRole,
} from "../services/managerOrder.service";
import { getOrderRemarks } from "@/modules/sales/services/order.service";

export interface ProductionOrderPdfDataOptions {
  orderNumber: string;
  rawOrderData: any;
  projectsList: any[];
  rawAssignmentsData?: any[];
}

export interface ProductionOrderPdfResult {
  doc: jsPDF;
  fileName: string;
  blob: Blob;
  blobUrl: string;
}

interface RenderJobCardOptions {
  doc: jsPDF;
  orderNumStr: string;
  custName: string;
  rawOrderData: any;
  proj: any;
  idx: number;
  totalItems: number;
  margin: number;
  contentWidth: number;
  primaryColor: string;
  accentColor: string;
  textColor: string;
  lightGray: string;
  borderGray: string;
  headerTitle: string;
  val: (v: any) => string;
  formatDate: (d: any) => string;
}

/**
 * Extracts a bracketed product code from a product name string if present,
 * e.g. "Acrylic Wall Art | 24x42 | 5mm | Spacer (AW-2442-5SP)" ->
 * { code: "AW-2442-5SP", cleanName: "Acrylic Wall Art | 24x42 | 5mm | Spacer" }
 */
function extractProductCodeFromName(productName: string): { code: string; cleanName: string } {
  if (!productName) return { code: "", cleanName: "" };
  const trimmed = productName.trim();

  // 1. Matches parentheses or brackets at the end: e.g. (AW-2442-5SP) or [AW-2442]
  const endMatch = trimmed.match(/\s*[\(\[]\s*([A-Za-z0-9_/-]+)\s*[\)\]]\s*$/);
  if (endMatch && endMatch[1]) {
    const code = endMatch[1].trim();
    const cleanName = trimmed.replace(/\s*[\(\[]\s*[A-Za-z0-9_/-]+\s*[\)\]]\s*$/, "").trim();
    return { code, cleanName: cleanName || trimmed };
  }

  // 2. Matches parentheses or brackets anywhere with at least 2 chars (e.g. [AW-101])
  const anyMatch = trimmed.match(/[\(\[]\s*([A-Za-z0-9_/-]{2,})\s*[\)\]]/);
  if (anyMatch && anyMatch[1]) {
    const code = anyMatch[1].trim();
    const cleanName = trimmed.replace(/\s*[\(\[]\s*[A-Za-z0-9_/-]{2,}\s*[\)\]]/, "").trim();
    return { code, cleanName: cleanName || trimmed };
  }

  return { code: "", cleanName: trimmed };
}

/**
 * Searches multiple candidate strings to find a bracketed product code and the cleanest name.
 */
function extractCodeAndCleanName(candidates: (string | undefined | null)[]): { code: string; cleanName: string } {
  // First pass: look for any candidate that contains a bracketed code
  for (const str of candidates) {
    if (!str || typeof str !== "string") continue;
    const res = extractProductCodeFromName(str);
    if (res.code) {
      return res;
    }
  }
  // Second pass: return first valid non-empty string as cleanName
  for (const str of candidates) {
    if (str && typeof str === "string") {
      const trimmed = str.trim();
      if (trimmed !== "" && trimmed !== "-" && trimmed !== "—" && trimmed.toLowerCase() !== "null") {
        return { code: "", cleanName: trimmed };
      }
    }
  }
  return { code: "", cleanName: "-" };
}

/**
 * Renders an individual 1-page Production Job Card for a single project/item.
 * Features item specifications, thumbnail preview, dynamic department checklists (Designer, Printing, Production, Logistics),
 * laser cutting / framing sub-processes, and handover/dispatch signoffs.
 */
function renderProductionJobCard({
  doc,
  orderNumStr,
  custName,
  rawOrderData,
  proj,
  idx,
  totalItems,
  margin,
  contentWidth,
  primaryColor,
  accentColor,
  textColor,
  headerTitle,
  val,
  formatDate,
}: RenderJobCardOptions) {
  let cardY = 16;
  const pName = val(proj.product_name || proj.project_name);
  const pId = val(proj.id || proj.project_id);
  const qty = Number(proj.quantity) || 1;
  const meta = proj._meta || extractProjectImageMeta(proj);
  const itemSeqStr = String(idx + 1).padStart(2, "0");
  const itemIdStr = `${orderNumStr}-${itemSeqStr}`;

  // 1. Header (Category title like "CRYSTAL WALL ART" is removed on job cards; main title is PRODUCTION JOB CARD)
  doc.setTextColor(primaryColor);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("PRODUCTION JOB CARD", margin, cardY);

  // Badge box on top right (soft yellow with golden border)
  const badgeW = 56;
  const badgeH = 12;
  const badgeX = margin + contentWidth - badgeW;
  doc.setFillColor(254, 249, 195); // yellow-100
  doc.setDrawColor(250, 204, 21); // yellow-400
  doc.setLineWidth(0.6);
  doc.roundedRect(badgeX, cardY - 4.5, badgeW, badgeH, 1.5, 1.5, "FD");

  doc.setTextColor(113, 63, 18); // yellow-900
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.text("REVIEW PROOF v2", badgeX + badgeW / 2, cardY - 0.5, { align: "center" });
  doc.setFontSize(8);
  doc.setTextColor(133, 77, 14); // yellow-800
  doc.text(itemIdStr, badgeX + badgeW / 2, cardY + 4, { align: "center" });

  // Subtitle (Item & Qty removed as requested)
  cardY += 5;
  doc.setTextColor(100, 116, 139);
  doc.setFontSize(8.5);
  doc.setFont("helvetica", "normal");
  doc.text(`Order: ${orderNumStr} | ${custName}`, margin, cardY);

  cardY += 4.5;
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.5);
  doc.line(margin, cardY, margin + contentWidth, cardY);

  // 2. Product Specifications Section
  cardY += 5.5;
  const specStartY = cardY;

  // Find project in rawOrderData to guarantee access to full database fields
  const matchInRaw = (rawOrderData?.projects || []).find(
    (rp: any) =>
      (rp.id || rp.project_id) === (proj.id || proj.project_id) ||
      (rp.project_name && proj.product_name && (
        String(rp.project_name).toLowerCase().includes(String(proj.product_name).toLowerCase()) ||
        String(proj.product_name).toLowerCase().includes(String(rp.project_name).toLowerCase())
      ))
  );

  const candidateNames = [
    proj.project_name,
    proj.product_name,
    matchInRaw?.project_name,
    matchInRaw?.product_name,
    pName,
  ];

  const { code: extractedCode, cleanName: extractedCleanName } = extractCodeAndCleanName(candidateNames);

  const explicitCode = val(
    proj.product_code ||
    proj.item_code ||
    proj.code ||
    matchInRaw?.product_code ||
    matchInRaw?.item_code ||
    matchInRaw?.code ||
    ""
  );

  const hasExplicitCode =
    explicitCode &&
    explicitCode !== "-" &&
    explicitCode !== "—" &&
    explicitCode.toLowerCase() !== "null" &&
    explicitCode.toLowerCase() !== "undefined";

  const productCodeDisplay = hasExplicitCode ? explicitCode : (extractedCode || "-");
  const productDisplayName = (extractedCleanName && extractedCleanName !== "-")
    ? extractedCleanName
    : val(proj.clean_product_name || proj.product_name || proj.project_name || pName);

  // Real data check helper (returns true only for genuine text, not "-" or "null")
  const isReal = (s: any): boolean => {
    if (s === undefined || s === null) return false;
    const str = String(s).trim();
    if (!str || str === "-" || str === "—") return false;
    const lower = str.toLowerCase();
    return (
      lower !== "null" &&
      lower !== "undefined" &&
      lower !== "none" &&
      lower !== "nil" &&
      lower !== "n/a"
    );
  };

  const rawImgCode = String(meta.code || proj.image_code || "").trim();
  const rawImgName = String(meta.name || proj.image_name || "").trim();
  const rawImgCat = String(
    meta.category ||
    proj.image_category_name ||
    proj.image_code_details?.category_name ||
    ""
  ).trim();

  const hasImgCode = isReal(rawImgCode);
  const hasImgName = isReal(rawImgName);
  const hasImgCat = isReal(rawImgCat);
  const hasAnyImgDetails = hasImgCode || hasImgName || hasImgCat;
  const hasThumbnail = Boolean(meta.base64 || (meta.imageUrl && meta.imageUrl.trim() !== ""));

  const renderSpecField = (x: number, y: number, label: string, value: string, maxW: number) => {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(6.5);
    doc.setTextColor(100, 116, 139);
    doc.text(label.toUpperCase(), x, y);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(textColor);
    const splitVal = doc.splitTextToSize(value, maxW);
    doc.text(splitVal.slice(0, 2), x, y + 4.2);
  };

  if (hasAnyImgDetails) {
    // Has genuine image metadata (Image Name / Code / Category)
    const thumbW = hasThumbnail ? 22 : 0;
    const thumbH = 22;
    const thumbX = margin + contentWidth - thumbW;
    const thumbY = specStartY;

    const availableTextW = hasThumbnail ? contentWidth - thumbW - 8 : contentWidth;
    const col1W = hasThumbnail ? 70 : 86;
    const col2W = availableTextW - col1W - 4;
    const col1X = margin;
    const col2X = margin + col1W + 4;

    // Row 1: Product Name & Image Name
    renderSpecField(col1X, specStartY, "PRODUCT NAME", productDisplayName, col1W - 2);
    if (hasImgName) {
      renderSpecField(col2X, specStartY, "IMAGE NAME", rawImgName, col2W - 2);
    }

    // Row 2: Product Code, Image Code & Image Category
    const row2Y = specStartY + 10.5;
    renderSpecField(col1X, row2Y, "PRODUCT CODE", productCodeDisplay, col1W - 2);

    if (hasImgCode || hasImgCat) {
      const imageCodeFormatted = hasImgCode
        ? rawImgCode.startsWith("#")
          ? rawImgCode
          : `#${rawImgCode}`
        : "-";
      const subColW = (col2W - 4) / 2;
      if (hasImgCode) {
        renderSpecField(col2X, row2Y, "IMAGE CODE", imageCodeFormatted, subColW - 2);
      }
      if (hasImgCat) {
        renderSpecField(col2X + subColW + 4, row2Y, "IMAGE CATEGORY", rawImgCat, subColW - 2);
      }
    }

    // Render Thumbnail Image
    if (hasThumbnail && meta.base64) {
      try {
        doc.setFillColor(248, 250, 252);
        doc.setDrawColor(203, 213, 225);
        doc.setLineWidth(0.4);
        doc.roundedRect(thumbX - 0.8, thumbY - 0.8, thumbW + 1.6, thumbH + 1.6, 1, 1, "FD");
        doc.addImage(meta.base64, "JPEG", thumbX, thumbY, thumbW, thumbH, undefined, "FAST");
      } catch {
        // Ignore image rendering error
      }
    }

    cardY = specStartY + 21;
  } else if (hasThumbnail) {
    // Only thumbnail image uploaded, but NO catalog image details (omit empty Image Name/Code/Cat)
    const thumbW = 22;
    const thumbH = 22;
    const thumbX = margin + contentWidth - thumbW;
    const thumbY = specStartY;

    const availableTextW = contentWidth - thumbW - 8;
    const col1W = 96;
    const col2W = availableTextW - col1W - 6;
    const col1X = margin;
    const col2X = margin + col1W + 6;

    renderSpecField(col1X, specStartY, "PRODUCT NAME", productDisplayName, col1W - 2);
    renderSpecField(col2X, specStartY, "PRODUCT CODE", productCodeDisplay, col2W - 2);

    if (meta.base64) {
      try {
        doc.setFillColor(248, 250, 252);
        doc.setDrawColor(203, 213, 225);
        doc.setLineWidth(0.4);
        doc.roundedRect(thumbX - 0.8, thumbY - 0.8, thumbW + 1.6, thumbH + 1.6, 1, 1, "FD");
        doc.addImage(meta.base64, "JPEG", thumbX, thumbY, thumbW, thumbH, undefined, "FAST");
      } catch {
        // Ignore image rendering error
      }
    }

    cardY = specStartY + 23;
  } else {
    // No image details and no thumbnail: Clean 2 columns for Product Name and Product Code
    const col1W = 110;
    const col2W = contentWidth - col1W - 6;
    const col1X = margin;
    const col2X = margin + col1W + 6;

    renderSpecField(col1X, specStartY, "PRODUCT NAME", productDisplayName, col1W - 2);
    renderSpecField(col2X, specStartY, "PRODUCT CODE", productCodeDisplay, col2W - 2);

    cardY = specStartY + 12;
  }

  // Instruction Sub-note
  cardY += 4;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  if (qty > 1) {
    doc.text(
      `Qty ${qty}: checks cover all pieces. Split job cards if designs need different routes.`,
      margin,
      cardY
    );
  } else {
    doc.text(
      "Tick after checking. Write N/A where not applicable. Checks apply to this item only.",
      margin,
      cardY
    );
  }

  // 3. Department Checklists (Dynamically filtered by assigned departments)
  cardY += 4;

  const designerItems = [
    "Image orientation checked",
    "   [ ] Vert       [ ] Horiz",
    "Text / spelling checked",
    "Spacer hole layout checked",
    "Design / crop / size checked",
    "Image code matches item",
    "Customer approval recorded",
    "Approved design ready",
  ];

  const printingItems = [
    "Image confirmation",
    "Orientation checked",
    "   [ ] Vert       [ ] Horiz",
    "Holes checked",
    "Acrylic size / thickness",
    "Acrylic spacer checked",
    "Sticker checked",
    "Colour / alignment checked",
    "No damage & Qty checked",
  ];

  const productionItems = [
    "Verify Size & Thickness as per order details",
    "Material Inspection before cutting.",
    "Customer Approval for unsized acrylic",
    "Reconfirm cut size and Order No. after cutting.",
    "In-charge Verification",
  ];

  const logisticsItems = [
    "Checked before packing",
    "Fittings packed",
    "Address / PIN / phone checked",
    "Quantity / condition checked",
    "Protective packing complete",
    "Packing photo recorded",
    "Payment release verified",
    "Item / parcel label checked",
    "Handover recorded",
  ];

  const depts: any[] = Array.isArray(proj.departments) ? proj.departments : [];

  const checkDeptAssigned = (deptId: number, nameMatch: string): boolean => {
    // If no department routing data exists on this item at all, default to showing it
    if (depts.length === 0) return true;
    const found = depts.find(
      (d: any) =>
        Number(d.department_id || d.id) === deptId ||
        (d.name && String(d.name).toLowerCase().includes(nameMatch.toLowerCase())) ||
        (d.department_name && String(d.department_name).toLowerCase().includes(nameMatch.toLowerCase()))
    );
    if (!found) return false;
    return Boolean(found.is_assigned);
  };

  const candidateDepts = [
    {
      id: 1,
      title: "DESIGNER",
      items: designerItems,
      isAssigned: checkDeptAssigned(1, "design"),
    },
    {
      id: 2,
      title: "PRINTING",
      items: printingItems,
      isAssigned: checkDeptAssigned(2, "print"),
    },
    {
      id: 3,
      title: "PRODUCTION",
      items: productionItems,
      isAssigned: checkDeptAssigned(3, "product"),
    },
    {
      id: 4,
      title: "LOGISTICS",
      items: logisticsItems,
      isAssigned: checkDeptAssigned(4, "logistic"),
    },
  ];

  let activeDepts = candidateDepts.filter((d) => d.isAssigned);
  if (activeDepts.length === 0) {
    activeDepts = candidateDepts;
  }

  const numCols = activeDepts.length;
  const colGap = numCols >= 4 ? 3.5 : numCols === 3 ? 4 : 6;
  const colWidth = (contentWidth - (numCols - 1) * colGap) / numCols;
  const boxHeight = 118; // mm

  const drawDeptBox = (
    x: number,
    y: number,
    title: string,
    items: string[],
    signOffQty: number,
    boxW: number,
    boxH: number
  ) => {
    // Outer Box
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(203, 213, 225);
    doc.setLineWidth(0.5);
    doc.roundedRect(x, y, boxW, boxH, 1.5, 1.5, "FD");

    // Header Bar
    doc.setFillColor(240, 253, 250); // Teal-50
    doc.roundedRect(x, y, boxW, 8, 1.5, 1.5, "F");
    doc.rect(x, y + 6, boxW, 2, "F");
    doc.setDrawColor(13, 148, 136); // Teal-600
    doc.line(x, y + 8, x + boxW, y + 8);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(boxW < 50 ? 8.5 : 9);
    doc.setTextColor(15, 118, 110); // Teal-700
    doc.text(title, x + 3.5, y + 5.5);

    // Items
    let itemY = y + 13.5;
    const maxItemTextW = boxW - 10;
    items.forEach((itemText) => {
      const isSubOption = itemText.startsWith("   ");
      if (!isSubOption) {
        doc.setDrawColor(100, 116, 139);
        doc.setFillColor(255, 255, 255);
        doc.setLineWidth(0.4);
        doc.rect(x + 3.5, itemY - 2.8, 3.2, 3.2, "FD");
      }

      doc.setFont("helvetica", "normal");
      doc.setFontSize(boxW < 50 ? 6.8 : 7.2);
      doc.setTextColor(textColor);
      const wrapped = doc.splitTextToSize(isSubOption ? itemText.trim() : itemText, maxItemTextW);
      doc.text(wrapped, isSubOption ? x + 5 : x + 8, itemY);

      itemY += Math.max(5.6, wrapped.length * 3.3);
    });

    // Sign-off Divider & Lines
    const signY = y + boxH - 26;
    doc.setDrawColor(226, 232, 240);
    doc.line(x + 3, signY, x + boxW - 3, signY);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(boxW < 50 ? 6.5 : 7);
    doc.setTextColor(71, 85, 105);

    doc.text("Done by: ____________________", x + 3.5, signY + 6);
    doc.text("Date/time: ___________________", x + 3.5, signY + 12.5);
    doc.text(`Qty: ___/${signOffQty} Recvd: _______`, x + 3.5, signY + 19);
  };

  activeDepts.forEach((dept, dIdx) => {
    const x = margin + dIdx * (colWidth + colGap);
    drawDeptBox(x, cardY, dept.title, dept.items, qty, colWidth, boxHeight);
  });

  cardY += boxHeight + 4;

  // 4. Sub-processes (Laser Cutting & Framing/Assembly)
  const subBoxW = (contentWidth - 4) / 2;
  const subBoxH = 17;
  const subBox1X = margin;
  const subBox2X = margin + subBoxW + 4;

  // Laser cutting box
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(subBox1X, cardY, subBoxW, subBoxH, 1.2, 1.2, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(15, 118, 110);
  doc.text("LASER CUTTING", subBox1X + 4, cardY + 4.5);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.rect(subBox1X + subBoxW - 14, cardY + 1.8, 2.8, 2.8, "FD");
  doc.text("N/A", subBox1X + subBoxW - 9, cardY + 4);

  doc.rect(subBox1X + 4, cardY + 7.5, 3, 3, "FD");
  doc.setFontSize(7.5);
  doc.setTextColor(textColor);
  doc.text("Cut size / holes / edges checked", subBox1X + 9, cardY + 10);
  doc.setFontSize(7);
  doc.setTextColor(71, 85, 105);
  doc.text("Done by / date: ____________________________", subBox1X + 4, cardY + 14.5);

  // Framing box
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(subBox2X, cardY, subBoxW, subBoxH, 1.2, 1.2, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(15, 118, 110);
  doc.text("FRAMING / ASSEMBLY", subBox2X + 4, cardY + 4.5);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.rect(subBox2X + subBoxW - 14, cardY + 1.8, 2.8, 2.8, "FD");
  doc.text("N/A", subBox2X + subBoxW - 9, cardY + 4);

  doc.rect(subBox2X + 4, cardY + 7.5, 3, 3, "FD");
  doc.setFontSize(7.5);
  doc.setTextColor(textColor);
  doc.text("Size / fit / mounting / finish checked", subBox2X + 9, cardY + 10);
  doc.setFontSize(7);
  doc.setTextColor(71, 85, 105);
  doc.text("Done by / date: ____________________________", subBox2X + 4, cardY + 14.5);

  cardY += subBoxH + 4;

  // 5. Tracking & Notes Footer
  const footerBoxH = 15;
  doc.setFillColor(250, 250, 250);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, cardY, contentWidth, footerBoxH, 1.2, 1.2, "FD");

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text(
    `Packed qty: ___ / ${qty}     Parcel ID: _________________     Dispatch / tracking: _____________________________`,
    margin + 4,
    cardY + 5.5
  );
  doc.text(
    "Notes / hold / rework reason and owner: ____________________________________________________________________",
    margin + 4,
    cardY + 11.5
  );
}

/**
 * Core PDF generation engine for Production Orders.
 * Renders identical styling, artwork specs, thumbnails, financial breakdowns, and workflow checklists.
 */
export async function generateProductionOrderPdfDocFromData({
  orderNumber,
  rawOrderData,
  projectsList,
  rawAssignmentsData,
}: ProductionOrderPdfDataOptions): Promise<ProductionOrderPdfResult> {
  const orderNumStr = orderNumber.trim() || "DRAFT";

  // Merge projectsList (which contains department routing & assignments) with rawOrderData.projects
  let rawProjects: any[] = [];
  if (projectsList && projectsList.length > 0) {
    rawProjects = projectsList.map((p: any) => {
      const pId = p.id || p.project_id;
      const matchInRaw = (rawOrderData?.projects || []).find(
        (rp: any) =>
          (rp.id || rp.project_id) === pId ||
          (rp.project_name && p.product_name && (
            String(rp.project_name).toLowerCase().includes(String(p.product_name).toLowerCase()) ||
            String(p.product_name).toLowerCase().includes(String(rp.project_name).toLowerCase())
          ))
      );

      const { code: foundCode, cleanName: foundCleanName } = extractCodeAndCleanName([
        matchInRaw?.project_name,
        p.project_name,
        p.product_name,
        matchInRaw?.product_name,
      ]);

      const resolvedCode =
        (p.product_code && p.product_code !== "-" ? p.product_code : null) ||
        (matchInRaw?.product_code && matchInRaw.product_code !== "-" ? matchInRaw.product_code : null) ||
        (matchInRaw?.item_code && matchInRaw.item_code !== "-" ? matchInRaw.item_code : null) ||
        foundCode ||
        "";

      return {
        ...(matchInRaw || {}),
        ...p,
        project_name: matchInRaw?.project_name || p.project_name || p.product_name,
        product_name: matchInRaw?.project_name || p.product_name || p.project_name,
        product_code: resolvedCode,
        item_code: resolvedCode,
        clean_product_name: foundCleanName,
        departments: p.departments || matchInRaw?.departments || [],
      };
    });
  } else if (rawOrderData?.projects && rawOrderData.projects.length > 0) {
    rawProjects = rawOrderData.projects;
  }

  // Enrich any missing departments from rawAssignmentsData if available
  if (rawAssignmentsData && Array.isArray(rawAssignmentsData)) {
    rawProjects = rawProjects.map((proj: any) => {
      if (proj.departments && proj.departments.length > 0) return proj;
      const projId = proj.id || proj.project_id;
      const assignMatch = rawAssignmentsData.find(
        (a: any) => (a.id || a.project_id) === projId
      );
      if (assignMatch && assignMatch.departments) {
        return {
          ...proj,
          departments: assignMatch.departments.map((d: any) => ({
            department_id: d.id || d.department_id,
            name: d.name || d.department_name,
            is_assigned: Boolean(d.is_assigned),
          })),
        };
      }
      return proj;
    });
  }

  // Preload images into base64 thumbnails in parallel
  const enrichedProjects = await Promise.all(
    rawProjects.map(async (proj: any) => {
      const meta = extractProjectImageMeta(proj);
      let base64: string | null = null;
      if (meta.imageUrl) {
        base64 = await loadBase64Image(meta.imageUrl);
      }
      return {
        ...proj,
        _meta: {
          ...meta,
          base64,
        },
      };
    })
  );

  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const primaryColor = "#1e1b4b"; // Dark Navy
  const accentColor = "#4338ca"; // Indigo
  const textColor = "#1e293b"; // Slate-800
  const lightGray = "#f8fafc";
  const borderGray = "#cbd5e1";

  const pageWidth = doc.internal.pageSize.getWidth(); // 210mm
  const margin = 14;
  const contentWidth = pageWidth - margin * 2; // 182mm

  const val = (v: any) =>
    v !== undefined && v !== null && String(v).trim() !== "" && String(v) !== "null"
      ? String(v)
      : "-";

  const formatCurrency = (amt: any) => {
    if (amt === undefined || amt === null || amt === "" || isNaN(Number(amt))) return "-";
    return `Rs. ${Number(amt).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const formatDate = (dateStr: any) => {
    if (!dateStr || dateStr === "null") return "-";
    const res = formatStandardDate(dateStr);
    return res === "—" ? "-" : res;
  };

  let currentY = 16;

  const checkPageBreak = (neededHeight: number) => {
    if (currentY + neededHeight > 275) {
      doc.addPage();
      currentY = 16;
      return true;
    }
    return false;
  };

  // ── Header Section ──────────────────────────────────────────────
  const categoryRaw =
    rawOrderData?.category_name ||
    rawOrderData?.category?.category_name ||
    rawOrderData?.category?.name ||
    (typeof rawOrderData?.category === "string" ? rawOrderData.category : "") ||
    rawProjects?.[0]?.category_name ||
    "";
  const headerTitle =
    categoryRaw && categoryRaw.trim() !== "" && categoryRaw !== "-"
      ? categoryRaw.trim().toUpperCase()
      : "AMAZE ADS";

  doc.setTextColor(primaryColor);
  doc.setFont("helvetica", "bold");

  let headerFontSize = 20;
  doc.setFontSize(headerFontSize);
  while (doc.getTextWidth(headerTitle) > 105 && headerFontSize > 11) {
    headerFontSize -= 1;
    doc.setFontSize(headerFontSize);
  }

  doc.text(headerTitle, margin, currentY);

  // Title & Order Number Badge Box
  doc.setFillColor(238, 242, 255);
  doc.setDrawColor(199, 210, 254);
  doc.roundedRect(125, currentY - 6, 71, 14, 2, 2, "FD");
  doc.setTextColor(accentColor);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("PRODUCTION ORDER", 160.5, currentY, { align: "center" });
  doc.setFontSize(9);
  doc.text(`ORDER #: ${orderNumStr}`, 160.5, currentY + 5, { align: "center" });

  currentY += 5;
  doc.setTextColor(textColor);
  doc.setFontSize(8.5);
  doc.setFont("helvetica", "normal");
  doc.text("Professional Signage & Advertising ERP", margin, currentY);

  currentY += 4;
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text(
    `Generated: ${new Date().toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })}`,
    margin,
    currentY
  );

  currentY += 5;
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.5);
  doc.line(margin, currentY, margin + contentWidth, currentY);

  currentY += 6;

  // ── Customer & Addresses Section ──────────────────────────────────
  const colWidth = (contentWidth - 6) / 2; // 88mm
  const leftX = margin;
  const rightX = margin + colWidth + 6;
  const boxStartY = currentY;

  const custName = val(rawOrderData?.customer_name);
  const custPhone = val(rawOrderData?.customer_mobile_number || rawOrderData?.mobile_number);
  const custWhatsapp = val(rawOrderData?.customer_whatsapp_number || rawOrderData?.whatsapp_number);

  const formatAddressLines = (addr: any): string[] => {
    if (!addr) return ["-"];

    const valStr = (v: any) =>
      v !== undefined &&
      v !== null &&
      String(v).trim() !== "" &&
      String(v) !== "null" &&
      String(v) !== "undefined" &&
      String(v) !== "-" &&
      String(v) !== "—"
        ? String(v).trim()
        : "";

    const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");

    // If string
    if (typeof addr === "string") {
      const clean = addr.trim();
      if (!clean || clean === "-" || clean === "—" || clean.toLowerCase() === "null") {
        return ["-"];
      }
      const rawLines = clean.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
      const uniqueLines: string[] = [];
      const seen = new Set<string>();

      for (const line of rawLines) {
        const cleanLine = line.replace(/^[,\s-]+|[,\s-]+$/g, "").trim();
        const norm = normalize(cleanLine);
        if (cleanLine && norm && !seen.has(norm)) {
          seen.add(norm);
          uniqueLines.push(cleanLine);
        }
      }
      return uniqueLines.length > 0 ? uniqueLines : ["-"];
    }

    // If object
    let l1 = valStr(addr.address_line_1 || addr.line1 || addr.address);
    let l2 = valStr(addr.address_line_2 || addr.line2);
    const dist = valStr(addr.district || addr.city);
    const state = valStr(addr.state);
    const pin = valStr(addr.pincode || addr.pin || addr.zip_code);
    const country = valStr(addr.country);

    const norm1 = normalize(l1);
    const norm2 = normalize(l2);

    // If l2 is dummy placeholder, empty, or duplicate of l1
    if (
      !norm2 ||
      norm2 === "addressline2" ||
      norm2 === norm1 ||
      (norm1.length > 0 && norm1.includes(norm2))
    ) {
      l2 = "";
    } else if (norm2.length > 0 && norm2.includes(norm1)) {
      l1 = "";
    }

    const blocks = [l1, l2].filter(Boolean);
    const lines: string[] = [];
    const seen = new Set<string>();

    for (const b of blocks) {
      const rawLines = b.split(/\r?\n/).map((s) => s.trim()).filter(Boolean);
      for (const raw of rawLines) {
        const cleanLine = raw.replace(/^[,\s-]+|[,\s-]+$/g, "").trim();
        const norm = normalize(cleanLine);
        if (cleanLine && norm && !seen.has(norm)) {
          seen.add(norm);
          lines.push(cleanLine);
        }
      }
    }

    // Check what is already present in lines to avoid repeating district, state, pin, country
    const fullNormalizedText = lines.map(normalize).join("");

    const locParts: string[] = [];
    if (dist && !fullNormalizedText.includes(normalize(dist))) {
      locParts.push(dist);
    }
    if (state && !fullNormalizedText.includes(normalize(state))) {
      locParts.push(state);
    }
    if (pin && !fullNormalizedText.includes(normalize(pin))) {
      locParts.push(`Pincode: ${pin}`);
    }
    if (
      country &&
      !fullNormalizedText.includes(normalize(country)) &&
      (locParts.length > 0 || country.toLowerCase() !== "india")
    ) {
      locParts.push(country);
    }

    if (locParts.length > 0) {
      lines.push(locParts.join(", "));
    }

    return lines.length > 0 ? lines : ["-"];
  };

  const billLines = formatAddressLines(rawOrderData?.billing_address);
  const shipLines = formatAddressLines(
    rawOrderData?.shipping_address || rawOrderData?.delivery_address || rawOrderData?.billing_address
  );

  // Left Column: Customer & Billing
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(accentColor);
  doc.text("CUSTOMER DETAILS", leftX, currentY);

  currentY += 4;
  doc.setFontSize(8.5);
  doc.setTextColor(textColor);

  doc.setFont("helvetica", "bold");
  doc.text("Name: ", leftX, currentY);
  doc.setFont("helvetica", "normal");
  doc.text(custName, leftX + 13, currentY);

  currentY += 4;
  doc.setFont("helvetica", "bold");
  doc.text("Phone: ", leftX, currentY);
  doc.setFont("helvetica", "normal");
  doc.text(custPhone, leftX + 13, currentY);

  currentY += 4;
  doc.setFont("helvetica", "bold");
  doc.text("WhatsApp: ", leftX, currentY);
  doc.setFont("helvetica", "normal");
  doc.text(custWhatsapp, leftX + 18, currentY);

  currentY += 5;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(accentColor);
  doc.text("BILLING ADDRESS", leftX, currentY);

  currentY += 4;
  doc.setFontSize(8);
  doc.setTextColor(textColor);
  doc.setFont("helvetica", "normal");
  billLines.forEach((l) => {
    const wrapped = doc.splitTextToSize(l, colWidth - 2);
    doc.text(wrapped, leftX, currentY);
    currentY += wrapped.length * 3.5;
  });

  const leftBoxHeight = currentY - boxStartY;

  // Right Column: Order Meta & Shipping
  currentY = boxStartY;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(accentColor);
  doc.text("ORDER META & SHIPPING", rightX, currentY);

  currentY += 4;
  doc.setFontSize(8.5);
  doc.setTextColor(textColor);

  const renderMeta = (label: string, value: string, yPos: number) => {
    doc.setFont("helvetica", "bold");
    doc.text(`${label}: `, rightX, yPos);
    doc.setFont("helvetica", "normal");
    const splitVal = doc.splitTextToSize(value, colWidth - 25);
    doc.text(splitVal, rightX + 25, yPos);
    return Math.max(3.8, splitVal.length * 3.5);
  };

  currentY += renderMeta(
    "Created By",
    val(rawOrderData?.created_by_name || rawOrderData?.created_by),
    currentY
  );
  currentY += renderMeta(
    "Category",
    val(rawOrderData?.category_name || rawOrderData?.category?.category_name),
    currentY
  );
  currentY += renderMeta(
    "Price Cat.",
    val(rawOrderData?.price_category_name || rawOrderData?.product_price_category_name),
    currentY
  );
  currentY += renderMeta(
    "Delivery Type",
    val(rawOrderData?.delivery_type_name || rawOrderData?.delivery_type?.name),
    currentY
  );

  currentY += 1;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(accentColor);
  doc.text("SHIPPING ADDRESS", rightX, currentY);

  currentY += 4;
  doc.setFontSize(8);
  doc.setTextColor(textColor);
  doc.setFont("helvetica", "normal");
  shipLines.forEach((l) => {
    const wrapped = doc.splitTextToSize(l, colWidth - 2);
    doc.text(wrapped, rightX, currentY);
    currentY += wrapped.length * 3.5;
  });

  const rightBoxHeight = currentY - boxStartY;
  currentY = boxStartY + Math.max(leftBoxHeight, rightBoxHeight) + 4;

  // ── Order Financials & Timelines Grid ─────────────────────────────
  checkPageBreak(28);

  doc.setFillColor(lightGray);
  doc.setDrawColor(borderGray);
  doc.roundedRect(margin, currentY, contentWidth, 22, 1.5, 1.5, "FD");

  const innerY = currentY + 4.5;
  doc.setFontSize(8);

  // Exact 4-column X positions aligned across all rows
  const c1 = margin + 4;
  const c2 = margin + 50;
  const c3 = margin + 98;
  const c4 = margin + 142;

  // Row 1
  doc.setTextColor(100, 116, 139);
  doc.setFont("helvetica", "bold");
  doc.text("Commit Date:", c1, innerY);
  doc.setTextColor(textColor);
  doc.setFont("helvetica", "normal");
  doc.text(formatDate(rawOrderData?.commit_date), c1 + 19, innerY);

  doc.setTextColor(100, 116, 139);
  doc.setFont("helvetica", "bold");
  doc.text("Completion Date:", c2, innerY);
  doc.setTextColor(textColor);
  doc.setFont("helvetica", "normal");
  doc.text(formatDate(rawOrderData?.completion_date), c2 + 24, innerY);

  doc.setTextColor(100, 116, 139);
  doc.setFont("helvetica", "bold");
  doc.text("Order Status:", c3, innerY);
  doc.setTextColor(accentColor);
  doc.setFont("helvetica", "bold");
  doc.text(val(rawOrderData?.order_status), c3 + 18, innerY);

  doc.setTextColor(100, 116, 139);
  doc.setFont("helvetica", "bold");
  doc.text("Total Units:", c4, innerY);
  doc.setTextColor(textColor);
  doc.setFont("helvetica", "normal");
  doc.text(
    val(rawOrderData?.total_units ?? rawOrderData?.total_quantity),
    c4 + 17,
    innerY
  );

  // Row 2
  const innerY2 = innerY + 5.5;
  doc.setTextColor(100, 116, 139);
  doc.setFont("helvetica", "bold");
  doc.text("Account Name:", c1, innerY2);
  doc.setTextColor(textColor);
  doc.setFont("helvetica", "normal");
  const accNameRaw = val(rawOrderData?.account_name || rawOrderData?.account?.account_name);
  const splitAcc = doc.splitTextToSize(accNameRaw, c2 - c1 - 22);
  doc.text(splitAcc[0] || "-", c1 + 21, innerY2);

  doc.setTextColor(100, 116, 139);
  doc.setFont("helvetica", "bold");
  doc.text("Payment Type:", c2, innerY2);
  doc.setTextColor(textColor);
  doc.setFont("helvetica", "normal");
  doc.text(val(rawOrderData?.payment_type), c2 + 20, innerY2);

  doc.setTextColor(100, 116, 139);
  doc.setFont("helvetica", "bold");
  doc.text("Payment Status:", c3, innerY2);
  doc.setTextColor(textColor);
  doc.setFont("helvetica", "normal");
  doc.text(val(rawOrderData?.payment_status), c3 + 23, innerY2);

  // Row 3
  const innerY3 = innerY2 + 5.5;
  const discountVal = Number(rawOrderData?.discount_amount ?? rawOrderData?.discount ?? 0);
  const hasDiscount = !isNaN(discountVal) && discountVal > 0;

  doc.setTextColor(100, 116, 139);
  doc.setFont("helvetica", "bold");
  doc.text("Paid Amount:", c1, innerY3);
  doc.setTextColor("#15803d");
  doc.setFont("helvetica", "bold");
  doc.text(formatCurrency(rawOrderData?.paid_amount), c1 + 19, innerY3);

  doc.setTextColor(100, 116, 139);
  doc.setFont("helvetica", "bold");
  doc.text("Balance Amount:", c2, innerY3);
  doc.setTextColor("#b91c1c");
  doc.setFont("helvetica", "bold");
  doc.text(formatCurrency(rawOrderData?.balance_amount), c2 + 24, innerY3);

  if (hasDiscount) {
    doc.setTextColor(100, 116, 139);
    doc.setFont("helvetica", "bold");
    doc.text("Discount:", c3, innerY3);
    doc.setTextColor("#e11d48"); // Rose-600
    doc.setFont("helvetica", "bold");
    doc.text(formatCurrency(discountVal), c3 + 14, innerY3);

    doc.setTextColor(100, 116, 139);
    doc.setFont("helvetica", "bold");
    doc.text("Final Amount:", c4, innerY3);
    doc.setTextColor(accentColor);
    doc.setFont("helvetica", "bold");
    doc.text(
      formatCurrency(rawOrderData?.final_amount || rawOrderData?.total_amount),
      c4 + 19,
      innerY3
    );
  } else {
    doc.setTextColor(100, 116, 139);
    doc.setFont("helvetica", "bold");
    doc.text("Final Amount:", c3, innerY3);
    doc.setTextColor(accentColor);
    doc.setFont("helvetica", "bold");
    doc.text(
      formatCurrency(rawOrderData?.final_amount || rawOrderData?.total_amount),
      c3 + 19,
      innerY3
    );
  }

  currentY += 26;

  // ── Projects Table Section ─────────────────────────────────────────
  checkPageBreak(30);

  doc.setFontSize(9.5);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(primaryColor);
  doc.text("ORDER PROJECTS & ARTWORK SPECIFICATIONS", margin, currentY);

  currentY += 4;

  const drawTableHeader = () => {
    doc.setFillColor(30, 27, 75);
    doc.rect(margin, currentY, contentWidth, 7.5, "F");
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(255, 255, 255);

    doc.text("#", margin + 3.5, currentY + 5, { align: "center" });
    doc.text("Artwork & Project Specifications", margin + 10, currentY + 5);
    doc.text("Project ID", margin + 102, currentY + 5, { align: "center" });
    doc.text("Qty", margin + 120, currentY + 5, { align: "center" });
    doc.text("Unit Price", margin + 143, currentY + 5, { align: "right" });
    doc.text("Addl Amt", margin + 162, currentY + 5, { align: "right" });
    doc.text("Amount", margin + 180, currentY + 5, { align: "right" });
    currentY += 7.5;
  };

  drawTableHeader();

  enrichedProjects.forEach((proj: any, idx: number) => {
    const pName = val(proj.project_name || proj.product_name);
    const pId = val(proj.id || proj.project_id);
    const qty = val(proj.quantity);
    const unitPrice = formatCurrency(proj.unit_price);
    const addlAmt = formatCurrency(proj.additional_amount);
    const amt = formatCurrency(proj.amount);
    const meta = proj._meta || extractProjectImageMeta(proj);

    const hasImage = Boolean(meta.base64);
    const thumbSize = 13; // 13mm x 13mm
    const thumbX = margin + 9;
    const textStartX = hasImage ? thumbX + thumbSize + 3 : margin + 9;
    const textAvailableWidth = hasImage ? 64 : 80;

    const wrappedName = doc.splitTextToSize(pName, textAvailableWidth);

    // Lines count to calculate exact row height
    let detailLines = wrappedName.length;
    if (meta.code || meta.category) detailLines += 1;
    if (meta.name) detailLines += 1;

    const textBlockHeight = detailLines * 3.8 + 4;
    const rowHeight = Math.max(hasImage ? thumbSize + 5 : 9, textBlockHeight);

    if (checkPageBreak(rowHeight + 6)) {
      drawTableHeader();
    }

    if (idx % 2 === 1) {
      doc.setFillColor(248, 250, 252);
      doc.rect(margin, currentY, contentWidth, rowHeight, "F");
    }

    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.line(margin, currentY + rowHeight, margin + contentWidth, currentY + rowHeight);

    const midY = currentY + rowHeight / 2 + 1.2;

    // Number
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(textColor);
    doc.text(`${idx + 1}`, margin + 3.5, midY, { align: "center" });

    // Image Thumbnail
    if (hasImage && meta.base64) {
      const thumbY = currentY + (rowHeight - thumbSize) / 2;
      try {
        doc.addImage(meta.base64, "JPEG", thumbX, thumbY, thumbSize, thumbSize);
        doc.setDrawColor(203, 213, 225);
        doc.setLineWidth(0.3);
        doc.roundedRect(thumbX, thumbY, thumbSize, thumbSize, 1, 1, "S");
      } catch (e) {
        console.warn("PDF image add failed:", e);
      }
    }

    // Details Text
    let lineY = currentY + 4;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(textColor);
    doc.text(wrappedName, textStartX, lineY);
    lineY += wrappedName.length * 3.8;

    // Code & Category Badge Line
    if (meta.code || meta.category) {
      doc.setFontSize(7.5);
      if (meta.code) {
        doc.setFont("helvetica", "bold");
        doc.setTextColor(accentColor);
        doc.text(`Code: #${meta.code}`, textStartX, lineY);
        const codeWidth = doc.getTextWidth(`Code: #${meta.code}`);
        if (meta.category) {
          doc.setFont("helvetica", "normal");
          doc.setTextColor(100, 116, 139);
          doc.text(` | Cat: ${meta.category}`, textStartX + codeWidth, lineY);
        }
      } else if (meta.category) {
        doc.setFont("helvetica", "normal");
        doc.setTextColor(100, 116, 139);
        doc.text(`Category: ${meta.category}`, textStartX, lineY);
      }
      lineY += 3.5;
    }

    // Artwork Name Line
    if (meta.name) {
      doc.setFontSize(7);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(100, 116, 139);
      const splitArtworkName = doc.splitTextToSize(`Artwork: ${meta.name}`, textAvailableWidth);
      doc.text(splitArtworkName, textStartX, lineY);
      lineY += splitArtworkName.length * 3.2;
    }

    // Project ID
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(textColor);
    doc.text(`#${pId}`, margin + 102, midY, { align: "center" });

    // Qty
    doc.setFont("helvetica", "bold");
    doc.text(`${qty}`, margin + 120, midY, { align: "center" });

    // Financials
    doc.setFont("helvetica", "normal");
    doc.text(unitPrice, margin + 143, midY, { align: "right" });
    doc.text(addlAmt, margin + 162, midY, { align: "right" });
    doc.setFont("helvetica", "bold");
    doc.text(amt, margin + 180, midY, { align: "right" });
    doc.setFont("helvetica", "normal");

    currentY += rowHeight;
  });

  currentY += 6;

  // ── ORDER REMARKS & PRODUCTION NOTES (Expanded on Page 1) ──────────
  checkPageBreak(35);

  doc.setFontSize(9.5);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(primaryColor);
  doc.text("ORDER REMARKS & PRODUCTION NOTES", margin, currentY);

  currentY += 4;
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(textColor);

  // Extract real remarks from rawOrderData or project items
  const isRealText = (v: any): boolean => {
    if (v === undefined || v === null) return false;
    const s = String(v).trim();
    if (s === "" || s === "-" || s === "—") return false;
    const lower = s.toLowerCase();
    if (
      lower === "null" ||
      lower === "undefined" ||
      lower === "nil" ||
      lower === "none" ||
      lower === "n/a"
    ) {
      return false;
    }
    return true;
  };

  const candidateRemarks = [
    rawOrderData?.remarks,
    rawOrderData?.order_remarks,
    rawOrderData?.order_notes,
    rawOrderData?.notes,
    rawOrderData?.customer_notes,
    rawOrderData?.special_instructions,
    rawOrderData?.requirements,
    rawOrderData?.description,
    rawOrderData?.data?.remarks,
    rawOrderData?.order?.remarks,
  ];

  let remarksRaw = candidateRemarks.find(isRealText);

  // If order level remarks not found, check project items
  if (!remarksRaw) {
    const projWithRemarks = rawProjects.find((p: any) =>
      [p?.remarks, p?.order_remarks, p?.notes, p?.description, p?.requirements].some(isRealText)
    );
    if (projWithRemarks) {
      remarksRaw = [
        projWithRemarks.remarks,
        projWithRemarks.order_remarks,
        projWithRemarks.notes,
        projWithRemarks.description,
        projWithRemarks.requirements,
      ].find(isRealText);
    }
  }

  const hasRemarks = Boolean(remarksRaw && isRealText(remarksRaw));
  const remarksText = hasRemarks
    ? String(remarksRaw).trim()
    : "No special production instructions recorded for this order.";

  const wrappedRemarks = doc.splitTextToSize(remarksText, contentWidth);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(hasRemarks ? textColor : "#64748b");
  doc.text(wrappedRemarks, margin, currentY + 4);

  currentY += Math.max(10, wrappedRemarks.length * 4.2 + 6);

  // ── Pages 2 to N: Individual Production Job Cards ─────────────────
  enrichedProjects.forEach((proj: any, idx: number) => {
    doc.addPage();
    renderProductionJobCard({
      doc,
      orderNumStr,
      custName,
      rawOrderData,
      proj,
      idx,
      totalItems: enrichedProjects.length,
      margin,
      contentWidth,
      primaryColor,
      accentColor,
      textColor,
      lightGray,
      borderGray,
      headerTitle,
      val,
      formatDate,
    });
  });

  // ── Footer & Page Numbers ──────────────────────────────────────────
  const pageCount = (doc as any).getNumberOfPages ? (doc as any).getNumberOfPages() : 1;
  const footerDateStr = new Date().toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184);
    doc.setDrawColor(226, 232, 240);
    doc.line(margin, 282, margin + contentWidth, 282);

    doc.text(
      `DRAFT FOR FEEDBACK | ${footerDateStr} | Not released for production`,
      margin,
      286
    );
    doc.text(`${i} / ${pageCount}`, margin + contentWidth, 286, { align: "right" });
  }

  // Prepare PDF
  const fileName = `Production-Order-${orderNumStr}.pdf`;
  const blob = doc.output("blob");
  const blobUrl = URL.createObjectURL(blob);

  return { doc, fileName, blob, blobUrl };
}

/**
 * Direct download helper using generated PDF document.
 */
export async function generateProductionOrderPdfFromData(
  options: ProductionOrderPdfDataOptions
): Promise<void> {
  const { doc, fileName, blobUrl } = await generateProductionOrderPdfDocFromData(options);
  doc.save(fileName);
  URL.revokeObjectURL(blobUrl);
}

/**
 * Fetch full order details & project assignments and generate the Production Order PDF Blob.
 * Used for in-app preview before download.
 */
export async function getProductionOrderPdfBlob(
  orderId: number,
  fallbackOrderNumber?: string,
  role: UserRole = "project-manager"
): Promise<ProductionOrderPdfResult> {
  const [assignmentsData, orderData, fetchedRemarks] = await Promise.all([
    getOrderProjectsAssignments(orderId, role).catch((err) => {
      console.warn("Could not fetch project assignments:", err);
      return [];
    }),
    getPMOrderById(orderId, role),
    getOrderRemarks(orderId).catch(() => null),
  ]);

  if (orderData && fetchedRemarks?.remarks && !orderData.remarks) {
    orderData.remarks = fetchedRemarks.remarks;
  }

  const orderProjects = orderData?.projects || [];
  const projectDetailsMap = new Map<number, any>();
  orderProjects.forEach((p: any) => {
    projectDetailsMap.set(p.id, p);
  });

  const today = new Date().toISOString().split("T")[0];

  const formattedProjects = (assignmentsData && assignmentsData.length > 0 ? assignmentsData : orderProjects).map((proj: any) => {
    const projId = proj.project_id || proj.id;
    const details = projectDetailsMap.get(projId) || {};

    const designDateVal = details.design_date || proj.design_date;
    const printingDateVal = details.printing_date || proj.printing_date;
    const fallbackDate = orderData?.commit_date ? orderData.commit_date.substring(0, 10) : today;

    const { code: pCode, cleanName: pCleanName } = extractCodeAndCleanName([
      details.project_name,
      proj.project_name,
      proj.product_name,
      details.product_name,
    ]);

    const resolvedCode =
      (proj.product_code && proj.product_code !== "-" ? proj.product_code : null) ||
      (details.product_code && details.product_code !== "-" ? details.product_code : null) ||
      (details.item_code && details.item_code !== "-" ? details.item_code : null) ||
      (proj.item_code && proj.item_code !== "-" ? proj.item_code : null) ||
      pCode ||
      "";

    const resolvedName =
      details.project_name ||
      proj.project_name ||
      proj.product_name ||
      details.product_name ||
      "";

    return {
      project_id: projId,
      id: projId,
      product_name: resolvedName,
      project_name: resolvedName,
      clean_product_name: pCleanName,
      product_code: resolvedCode,
      item_code: resolvedCode,
      quantity: proj.quantity || details.quantity,
      unit_price: details.unit_price ?? proj.unit_price,
      additional_amount: details.additional_amount ?? proj.additional_amount,
      amount: details.amount ?? proj.amount,
      design_date: designDateVal && designDateVal !== "null" ? designDateVal.substring(0, 10) : fallbackDate,
      printing_date: printingDateVal && printingDateVal !== "null" ? printingDateVal.substring(0, 10) : fallbackDate,
      departments: (() => {
        const depts = (proj.departments || []).map((d: any) => {
          const isLogistics =
            (d.id || d.department_id) === 4 ||
            (d.name || d.department_name)?.toLowerCase() === "logistics";
          return {
            department_id: d.id || d.department_id,
            name: d.name || d.department_name,
            is_assigned: isLogistics ? true : Boolean(d.is_assigned),
          };
        });
        const hasLogistics = depts.some(
          (d: any) =>
            d.department_id === 4 ||
            d.name?.toLowerCase() === "logistics"
        );
        if (!hasLogistics && depts.length > 0) {
          depts.push({
            department_id: 4,
            name: "logistics",
            is_assigned: true,
          });
        }
        return depts;
      })(),
      image_code_details: details.image_code_details || proj.image_code_details,
      image_code: details.image_code || proj.image_code,
      image_name: details.image_name || proj.image_name,
      image_category_name:
        details.image_category_name ||
        details.image_code_details?.category_name ||
        proj.image_category_name,
      project_images: details.project_images || proj.project_images,
    };
  });

  const resolvedOrderNumber =
    orderData?.order_number || fallbackOrderNumber || String(orderId);

  return generateProductionOrderPdfDocFromData({
    orderNumber: resolvedOrderNumber,
    rawOrderData: orderData,
    projectsList: formattedProjects,
    rawAssignmentsData: assignmentsData,
  });
}

/**
 * Convenience helper to fetch full order details & project assignments by Order ID,
 * and immediately trigger download of the Production Order PDF.
 */
export async function downloadProductionOrderPdf(
  orderId: number,
  fallbackOrderNumber?: string,
  role: UserRole = "project-manager"
): Promise<void> {
  const { doc, fileName, blobUrl } = await getProductionOrderPdfBlob(orderId, fallbackOrderNumber, role);
  doc.save(fileName);
  URL.revokeObjectURL(blobUrl);
}
