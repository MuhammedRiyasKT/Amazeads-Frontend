import { jsPDF } from "jspdf";
import { loadBase64Image, extractProjectImageMeta } from "@/lib/pdfHelper";
import { formatDate as formatStandardDate } from "@/lib/formatDate";
import {
  getOrderProjectsAssignments,
  getPMOrderById,
  UserRole,
} from "../services/managerOrder.service";

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
 * Renders an individual 1-page Production Job Card for a single project/item.
 * Features item specifications, thumbnail preview, 3-column department checklists (Designer, Printing, Logistics),
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
  const pName = val(proj.project_name || proj.product_name);
  const pId = val(proj.id || proj.project_id);
  const qty = Number(proj.quantity) || 1;
  const meta = proj._meta || extractProjectImageMeta(proj);
  const itemSeqStr = String(idx + 1).padStart(2, "0");
  const totalSeqStr = String(totalItems).padStart(2, "0");
  const itemIdStr = `${orderNumStr}-${itemSeqStr}`;
  const completionDateStr = formatDate(
    rawOrderData?.completion_date || proj.completion_date
  );

  // 1. Header
  doc.setTextColor(primaryColor);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text(headerTitle, margin, cardY);

  // Badge box on top right (soft yellow with golden border)
  const badgeW = 60;
  const badgeH = 13;
  const badgeX = margin + contentWidth - badgeW;
  doc.setFillColor(254, 249, 195); // yellow-100
  doc.setDrawColor(250, 204, 21); // yellow-400
  doc.setLineWidth(0.6);
  doc.roundedRect(badgeX, cardY - 5, badgeW, badgeH, 1.5, 1.5, "FD");

  doc.setTextColor(113, 63, 18); // yellow-900
  doc.setFontSize(8.5);
  doc.setFont("helvetica", "bold");
  doc.text("REVIEW PROOF v2", badgeX + badgeW / 2, cardY - 0.5, { align: "center" });
  doc.setFontSize(8.5);
  doc.setTextColor(133, 77, 14); // yellow-800
  doc.text(itemIdStr, badgeX + badgeW / 2, cardY + 4.5, { align: "center" });

  cardY += 5;
  doc.setTextColor(accentColor);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("PRODUCTION JOB CARD", margin, cardY);

  cardY += 4.5;
  doc.setTextColor(100, 116, 139);
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text(
    `Order: ${orderNumStr} | ${custName} | Item ${itemSeqStr} of ${totalSeqStr} | Qty ${qty}`,
    margin,
    cardY
  );

  cardY += 4;
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.5);
  doc.line(margin, cardY, margin + contentWidth, cardY);

  // 2. Item Specifications Grid
  cardY += 6;
  const specStartY = cardY;
  const colW = (contentWidth - 6) / 2; // 88mm
  const leftColX = margin;
  const rightColX = margin + colW + 6;

  const renderSpecField = (x: number, y: number, label: string, value: string) => {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(6.5);
    doc.setTextColor(100, 116, 139);
    doc.text(label.toUpperCase(), x, y);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(textColor);
    const splitVal = doc.splitTextToSize(value, colW - (meta.base64 ? 26 : 2));
    doc.text(splitVal[0] || value, x, y + 4.2);
  };

  // Row 1
  renderSpecField(
    leftColX,
    cardY,
    "PROPOSED ITEM ID / SOURCE PROJECT",
    `${itemIdStr} / #${pId}`
  );

  const productDisplayName = val(meta.name || pName);
  renderSpecField(rightColX, cardY, "PRODUCT", productDisplayName);

  // Row 2
  cardY += 9;
  const productCodeDisplay = val(meta.code || proj.product_code || proj.item_code);
  renderSpecField(leftColX, cardY, "PRODUCT CODE", productCodeDisplay);

  const imageCodeDisplay = meta.artworkCode || (meta.code ? `#${meta.code}` : "__________________________");
  renderSpecField(rightColX, cardY, "IMAGE CODE", imageCodeDisplay);

  // Row 3
  cardY += 9;
  const sizeDisplay = `${val(meta.size || proj.size || proj.dimensions)} | W ______ x H ______ in`;
  renderSpecField(leftColX, cardY, "SIZE AS RECORDED / FINAL W X H", sizeDisplay);

  const materialDisplay = val(
    proj.material || proj.thickness || proj.specification || "Acrylic / 3 mm / Sticker"
  );
  renderSpecField(rightColX, cardY, "MATERIAL / THICKNESS / FITTING", materialDisplay);

  // Row 4
  cardY += 9;
  const qtyDisplay = `${qty} piece${qty > 1 ? "s" : ""} / ${completionDateStr}`;
  renderSpecField(leftColX, cardY, "QTY / COMPLETION DATE IN SOURCE", qtyDisplay);

  const pmDisplay = `Status: ${val(proj.status || rawOrderData?.order_status)} | PM: ${val(rawOrderData?.created_by_name || rawOrderData?.created_by)}`;
  renderSpecField(rightColX, cardY, "ITEM STATUS / ASSIGNED PM", pmDisplay);

  // If thumbnail image exists, render it cleanly
  if (meta.base64) {
    try {
      const thumbW = 20;
      const thumbH = 20;
      const thumbX = margin + contentWidth - thumbW;
      const thumbY = specStartY + 2;
      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(203, 213, 225);
      doc.roundedRect(thumbX - 1, thumbY - 1, thumbW + 2, thumbH + 2, 1, 1, "FD");
      doc.addImage(meta.base64, "JPEG", thumbX, thumbY, thumbW, thumbH, undefined, "FAST");
    } catch {
      // Ignore image rendering error
    }
  }

  // Instruction Sub-note
  cardY += 9;
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

  // 3. Department Checklists (3 Columns: Designer, Printing, Logistics)
  cardY += 4;
  const colWidth3 = (contentWidth - 8) / 3; // (182 - 8) / 3 = 58mm
  const col1X = margin;
  const col2X = margin + colWidth3 + 4;
  const col3X = col2X + colWidth3 + 4;
  const boxHeight = 120; // 120mm height

  const drawDeptBox = (
    x: number,
    y: number,
    title: string,
    items: string[],
    signOffQty: number
  ) => {
    // Outer Box
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(203, 213, 225);
    doc.setLineWidth(0.5);
    doc.roundedRect(x, y, colWidth3, boxHeight, 1.5, 1.5, "FD");

    // Header Bar
    doc.setFillColor(240, 253, 250); // Teal-50
    doc.roundedRect(x, y, colWidth3, 8, 1.5, 1.5, "F");
    doc.rect(x, y + 6, colWidth3, 2, "F");
    doc.setDrawColor(13, 148, 136); // Teal-600
    doc.line(x, y + 8, x + colWidth3, y + 8);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(15, 118, 110); // Teal-700
    doc.text(title, x + 4, y + 5.5);

    // Items
    let itemY = y + 14;
    items.forEach((itemText) => {
      // Draw checkbox square
      doc.setDrawColor(100, 116, 139);
      doc.setFillColor(255, 255, 255);
      doc.setLineWidth(0.4);
      doc.rect(x + 4, itemY - 2.8, 3.2, 3.2, "FD");

      // Draw item text
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(textColor);
      doc.text(itemText, x + 9, itemY);

      itemY += 6.2;
    });

    // Sign-off Divider & Lines
    const signY = y + boxHeight - 27;
    doc.setDrawColor(226, 232, 240);
    doc.line(x + 3, signY, x + colWidth3 - 3, signY);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(71, 85, 105);

    doc.text("Done by: ________________________", x + 4, signY + 6);
    doc.text("Date/time: _______________________", x + 4, signY + 13);
    doc.text(`Qty: ___ / ${signOffQty} Received: ________`, x + 4, signY + 20);
  };

  const designerItems = [
    "Image orientation checked",
    "   [ ] Vertical      [ ] Horizontal",
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
    "   [ ] Vertical      [ ] Horizontal",
    "Holes checked",
    "Acrylic size / thickness",
    "Acrylic spacer checked",
    "Sticker checked",
    "Colour / alignment checked",
    "No damage & Qty checked",
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

  drawDeptBox(col1X, cardY, "DESIGNER", designerItems, qty);
  drawDeptBox(col2X, cardY, "PRINTING", printingItems, qty);
  drawDeptBox(col3X, cardY, "LOGISTICS", logisticsItems, qty);

  cardY += boxHeight + 4;

  // 4. Sub-processes (Laser Cutting & Framing/Assembly)
  const subBoxW = (contentWidth - 4) / 2;
  const subBoxH = 18;

  // Laser cutting box
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(col1X, cardY, subBoxW, subBoxH, 1.2, 1.2, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(15, 118, 110);
  doc.text("LASER CUTTING", col1X + 4, cardY + 4.5);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.rect(col1X + subBoxW - 14, cardY + 1.8, 2.8, 2.8, "FD");
  doc.text("N/A", col1X + subBoxW - 9, cardY + 4);

  doc.rect(col1X + 4, cardY + 8, 3, 3, "FD");
  doc.setFontSize(7.5);
  doc.setTextColor(textColor);
  doc.text("Cut size / holes / edges checked", col1X + 9, cardY + 10.5);
  doc.setFontSize(7);
  doc.setTextColor(71, 85, 105);
  doc.text("Done by / date: ____________________________", col1X + 4, cardY + 15);

  // Framing box
  const subBox2X = col1X + subBoxW + 4;
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

  doc.rect(subBox2X + 4, cardY + 8, 3, 3, "FD");
  doc.setFontSize(7.5);
  doc.setTextColor(textColor);
  doc.text("Size / fit / mounting / finish checked", subBox2X + 9, cardY + 10.5);
  doc.setFontSize(7);
  doc.setTextColor(71, 85, 105);
  doc.text("Done by / date: ____________________________", subBox2X + 4, cardY + 15);

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

  const rawProjects =
    rawOrderData?.projects && rawOrderData.projects.length > 0
      ? rawOrderData.projects
      : projectsList || [];

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

  const formatAddressLines = (addr: any) => {
    if (!addr) return ["-"];
    if (typeof addr === "string") return [addr];
    const l1 = val(addr.address_line_1);
    const l2 = val(addr.address_line_2);
    const dist = val(addr.district || addr.city);
    const state = val(addr.state);
    const pin = val(addr.pincode);
    const country = val(addr.country);

    const line1 = [l1, l2].filter((s) => s !== "-").join(", ");
    const line2 = [dist, state, pin !== "-" ? `Pincode: ${pin}` : "", country]
      .filter((s) => s !== "-")
      .join(", ");
    const res = [];
    if (line1) res.push(line1);
    if (line2) res.push(line2);
    return res.length > 0 ? res : ["-"];
  };

  const billLines = formatAddressLines(rawOrderData?.billing_address);
  const shipLines = formatAddressLines(
    rawOrderData?.shipping_address || rawOrderData?.delivery_address
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
  doc.setFont("helvetica", "bold");
  doc.setTextColor(100, 116, 139);

  // Row 1
  doc.text("Commit Date:", margin + 4, innerY);
  doc.setTextColor(textColor);
  doc.setFont("helvetica", "normal");
  doc.text(formatDate(rawOrderData?.commit_date), margin + 26, innerY);

  doc.setTextColor(100, 116, 139);
  doc.setFont("helvetica", "bold");
  doc.text("Completion Date:", margin + 55, innerY);
  doc.setTextColor(textColor);
  doc.setFont("helvetica", "normal");
  doc.text(formatDate(rawOrderData?.completion_date), margin + 82, innerY);

  doc.setTextColor(100, 116, 139);
  doc.setFont("helvetica", "bold");
  doc.text("Order Status:", margin + 112, innerY);
  doc.setTextColor(accentColor);
  doc.setFont("helvetica", "bold");
  doc.text(val(rawOrderData?.order_status), margin + 133, innerY);

  doc.setTextColor(100, 116, 139);
  doc.setFont("helvetica", "bold");
  doc.text("Total Units:", margin + 155, innerY);
  doc.setTextColor(textColor);
  doc.setFont("helvetica", "normal");
  doc.text(
    val(rawOrderData?.total_units ?? rawOrderData?.total_quantity),
    margin + 173,
    innerY
  );

  // Row 2
  const innerY2 = innerY + 5.5;
  doc.setTextColor(100, 116, 139);
  doc.setFont("helvetica", "bold");
  doc.text("Account Name:", margin + 4, innerY2);
  doc.setTextColor(textColor);
  doc.setFont("helvetica", "normal");
  doc.text(
    val(rawOrderData?.account_name || rawOrderData?.account?.account_name),
    margin + 26,
    innerY2
  );

  doc.setTextColor(100, 116, 139);
  doc.setFont("helvetica", "bold");
  doc.text("Payment Type:", margin + 55, innerY2);
  doc.setTextColor(textColor);
  doc.setFont("helvetica", "normal");
  doc.text(val(rawOrderData?.payment_type), margin + 78, innerY2);

  doc.setTextColor(100, 116, 139);
  doc.setFont("helvetica", "bold");
  doc.text("Payment Status:", margin + 112, innerY2);
  doc.setTextColor(textColor);
  doc.setFont("helvetica", "normal");
  doc.text(val(rawOrderData?.payment_status), margin + 137, innerY2);

  // Row 3
  const innerY3 = innerY2 + 5.5;
  doc.setTextColor(100, 116, 139);
  doc.setFont("helvetica", "bold");
  doc.text("Paid Amount:", margin + 4, innerY3);
  doc.setTextColor("#15803d");
  doc.setFont("helvetica", "bold");
  doc.text(formatCurrency(rawOrderData?.paid_amount), margin + 26, innerY3);

  doc.setTextColor(100, 116, 139);
  doc.setFont("helvetica", "bold");
  doc.text("Balance Amount:", margin + 55, innerY3);
  doc.setTextColor("#b91c1c");
  doc.setFont("helvetica", "bold");
  doc.text(formatCurrency(rawOrderData?.balance_amount), margin + 82, innerY3);

  doc.setTextColor(100, 116, 139);
  doc.setFont("helvetica", "bold");
  doc.text("Final Amount:", margin + 112, innerY3);
  doc.setTextColor(accentColor);
  doc.setFont("helvetica", "bold");
  doc.text(
    formatCurrency(rawOrderData?.final_amount || rawOrderData?.total_amount),
    margin + 133,
    innerY3
  );

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

  const remarksRaw = rawOrderData?.remarks;
  const hasRemarks =
    remarksRaw &&
    String(remarksRaw).trim() !== "" &&
    String(remarksRaw).trim() !== "-" &&
    String(remarksRaw).trim() !== "null";

  const remarksText = hasRemarks
    ? String(remarksRaw).trim()
    : "No special production instructions recorded for this order.";

  const wrappedRemarks = doc.splitTextToSize(remarksText, contentWidth - 8);
  const remarksHeight = Math.max(22, wrappedRemarks.length * 4 + 7);

  doc.setFillColor(lightGray);
  doc.setDrawColor(borderGray);
  doc.roundedRect(margin, currentY, contentWidth, remarksHeight, 1.5, 1.5, "FD");

  doc.setTextColor(hasRemarks ? textColor : 100);
  doc.text(wrappedRemarks, margin + 4, currentY + 5.5);

  if (!hasRemarks || remarksHeight < 30) {
    doc.setDrawColor(226, 232, 240);
    const noteLineY = currentY + remarksHeight - 6;
    doc.line(margin + 4, noteLineY, margin + contentWidth - 4, noteLineY);
  }

  currentY += remarksHeight + 6;

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
  const [assignmentsData, orderData] = await Promise.all([
    getOrderProjectsAssignments(orderId, role).catch((err) => {
      console.warn("Could not fetch project assignments:", err);
      return [];
    }),
    getPMOrderById(orderId, role),
  ]);

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

    return {
      project_id: projId,
      id: projId,
      product_name: proj.product_name || proj.project_name || details.project_name,
      project_name: proj.product_name || proj.project_name || details.project_name,
      quantity: proj.quantity || details.quantity,
      unit_price: details.unit_price ?? proj.unit_price,
      additional_amount: details.additional_amount ?? proj.additional_amount,
      amount: details.amount ?? proj.amount,
      design_date: designDateVal && designDateVal !== "null" ? designDateVal.substring(0, 10) : fallbackDate,
      printing_date: printingDateVal && printingDateVal !== "null" ? printingDateVal.substring(0, 10) : fallbackDate,
      departments: (proj.departments || []).map((d: any) => ({
        department_id: d.id || d.department_id,
        name: d.name || d.department_name,
        is_assigned: Boolean(d.is_assigned),
      })),
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
