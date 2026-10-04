/**
 * PDF Helper Utilities
 * Provides resilient image base64 preloading, metadata extraction,
 * and high-fidelity PDF generators for Production Orders and Sales Quotations.
 */

import { jsPDF } from "jspdf";

export interface ProjectImageMeta {
  code: string;
  name: string;
  category: string;
  imageUrl: string;
  base64?: string | null;
}

/**
 * Safely converts an image URL (Cloudinary, S3, or external) to a base64 Data URL
 * suitable for embedding directly into jsPDF with doc.addImage().
 * Uses an in-memory canvas to scale down the image (max 220px) to keep PDF file sizes small.
 * Gracefully times out or catches errors so PDF generation never fails.
 */
export async function loadBase64Image(
  url: string | null | undefined,
  timeoutMs: number = 3200
): Promise<string | null> {
  if (!url || typeof url !== "string" || !url.startsWith("http")) return null;

  return new Promise((resolve) => {
    let hasResolved = false;
    const finish = (result: string | null) => {
      if (!hasResolved) {
        hasResolved = true;
        resolve(result);
      }
    };

    const timer = setTimeout(() => {
      finish(null);
    }, timeoutMs);

    try {
      const img = new Image();
      img.crossOrigin = "anonymous";

      img.onload = () => {
        clearTimeout(timer);
        try {
          const maxDim = 220;
          let w = img.naturalWidth || img.width || maxDim;
          let h = img.naturalHeight || img.height || maxDim;

          if (w > maxDim || h > maxDim) {
            if (w >= h) {
              h = Math.round((h * maxDim) / w);
              w = maxDim;
            } else {
              w = Math.round((w * maxDim) / h);
              h = maxDim;
            }
          }

          const canvas = document.createElement("canvas");
          canvas.width = Math.max(w, 1);
          canvas.height = Math.max(h, 1);
          const ctx = canvas.getContext("2d");
          if (!ctx) {
            finish(null);
            return;
          }

          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
          finish(dataUrl);
        } catch (canvasErr) {
          console.warn("Canvas conversion error for PDF thumbnail:", canvasErr);
          finish(null);
        }
      };

      img.onerror = () => {
        clearTimeout(timer);
        finish(null);
      };

      img.src = url;
    } catch {
      clearTimeout(timer);
      finish(null);
    }
  });
}

/**
 * Extracts normalized Image Code, Name, Category and Image URL from project/item object
 */
export function extractProjectImageMeta(proj: any): ProjectImageMeta {
  const code =
    proj?.image_code_details?.image_code ||
    proj?.image_code ||
    "";
  const name =
    proj?.image_code_details?.image_name ||
    proj?.image_name ||
    "";
  const category =
    proj?.image_code_details?.category_name ||
    proj?.image_category_name ||
    proj?.image_category ||
    "";
  const imageUrl =
    proj?.image_code_details?.image_url ||
    (Array.isArray(proj?.project_images) && proj.project_images.length > 0
      ? proj.project_images[0]?.img_url || proj.project_images[0]
      : "") ||
    "";

  return {
    code: String(code || "").trim(),
    name: String(name || "").trim(),
    category: String(category || "").trim(),
    imageUrl: typeof imageUrl === "string" ? imageUrl.trim() : "",
  };
}

export function formatPdfCurrency(amt: any): string {
  if (amt === undefined || amt === null || amt === "" || isNaN(Number(amt))) return "Rs. 0.00";
  return `Rs. ${Number(amt).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function formatPdfDate(dateStr: any): string {
  if (!dateStr || dateStr === "null") return "-";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return String(dateStr);
    return d.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });
  } catch {
    return String(dateStr);
  }
}

export interface QuotationPdfItem {
  productName: string;
  quantity: number;
  unitPrice: number;
  additionalAmount?: number;
  amount?: number;
  imageCode?: string;
  imageName?: string;
  imageCategory?: string;
  imageUrl?: string;
  image_code_details?: any;
  project_images?: any[];
}

export interface QuotationPdfData {
  quotationNumber: string;
  quotationDate: string;
  customerName: string;
  customerMobile: string;
  customerWhatsapp?: string;
  billingAddress?: any;
  shippingAddress?: any;
  deliveryType?: string;
  categoryName?: string;
  priceCategoryName?: string;
  items: QuotationPdfItem[];
  subTotal: number;
  discount: number;
  finalAmount: number;
  remarks?: string;
  fileName?: string;
}

/**
 * High-fidelity, user-friendly Quotation PDF generator
 * Supports image thumbnails, Image Code, Artwork Name, Category, and multi-page layouts.
 */
export async function generateQuotationPdf(data: QuotationPdfData): Promise<void> {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  const primaryColor = "#0f172a"; // Deep Slate
  const navyColor = "#1e1b4b"; // Dark Indigo / Navy
  const accentColor = "#4338ca"; // Indigo Accent
  const textColor = "#1e293b"; // Slate-800
  const secondaryColor = "#64748b"; // Slate-500
  const lightGray = "#f8fafc";
  const borderGray = "#cbd5e1";

  const pageWidth = doc.internal.pageSize.getWidth(); // 210mm
  const margin = 14;
  const contentWidth = pageWidth - margin * 2; // 182mm

  const val = (v: any) =>
    v !== undefined && v !== null && String(v).trim() !== "" && String(v) !== "null" ? String(v) : "—";

  const formatAddressLines = (addr: any) => {
    if (!addr) return ["—"];
    if (typeof addr === "string") return [addr.trim() || "—"];
    const l1 = val(addr.address_line_1 || addr.line1);
    const l2 = val(addr.address_line_2 || addr.line2);
    const dist = val(addr.district || addr.city);
    const state = val(addr.state);
    const pin = val(addr.pincode);
    const country = val(addr.country);

    const line1 = [l1, l2].filter((s) => s !== "—").join(", ");
    const line2 = [dist, state, pin !== "—" ? `Pin: ${pin}` : "", country].filter((s) => s !== "—").join(", ");
    const res = [];
    if (line1) res.push(line1);
    if (line2) res.push(line2);
    return res.length > 0 ? res : ["—"];
  };

  // Preload all item images into base64 in parallel
  const enrichedItems = await Promise.all(
    (data.items || []).map(async (item) => {
      const meta = extractProjectImageMeta(item);
      let base64: string | null = null;
      if (meta.imageUrl) {
        base64 = await loadBase64Image(meta.imageUrl);
      }
      return {
        ...item,
        _meta: {
          ...meta,
          base64,
        },
      };
    })
  );

  let currentY = 16;

  const checkPageBreak = (neededHeight: number) => {
    if (currentY + neededHeight > 275) {
      doc.addPage();
      currentY = 16;
      return true;
    }
    return false;
  };

  // ── Header Branding ──────────────────────────────────────────────────
  doc.setTextColor(navyColor);
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text("AMAZE ADS", margin, currentY);

  // Title & Quotation Number Badge Box
  doc.setFillColor(238, 242, 255);
  doc.setDrawColor(199, 210, 254);
  doc.roundedRect(122, currentY - 6, 74, 15, 2, 2, "FD");

  doc.setTextColor(accentColor);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("PRICE QUOTATION", 159, currentY, { align: "center" });

  doc.setFontSize(8.5);
  doc.setTextColor(navyColor);
  doc.text(`QUOTE NO: ${data.quotationNumber || "DRAFT"}`, 159, currentY + 5.2, { align: "center" });

  currentY += 5;
  doc.setTextColor(textColor);
  doc.setFontSize(8.5);
  doc.setFont("helvetica", "normal");
  doc.text("Professional Signage & Advertising ERP Solutions", margin, currentY);

  currentY += 4;
  doc.setFontSize(8);
  doc.setTextColor(secondaryColor);
  doc.text("Email: info@amazeads.in  |  Phone: +91 95393 06810  |  Web: www.amazeads.in", margin, currentY);

  currentY += 5;
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.5);
  doc.line(margin, currentY, margin + contentWidth, currentY);

  currentY += 6;

  // ── Customer & Quote Information Card ─────────────────────────────────
  const colWidth = (contentWidth - 6) / 2; // 88mm
  const leftX = margin;
  const rightX = margin + colWidth + 6;
  const boxStartY = currentY;

  const billLines = formatAddressLines(data.billingAddress);
  const shipLines = formatAddressLines(data.shippingAddress);

  // Left Column: Customer Details
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(accentColor);
  doc.text("CUSTOMER DETAILS", leftX, currentY);

  currentY += 4;
  doc.setFontSize(8.5);
  doc.setTextColor(textColor);

  doc.setFont("helvetica", "bold");
  doc.text("Customer: ", leftX, currentY);
  doc.setFont("helvetica", "normal");
  doc.text(val(data.customerName), leftX + 18, currentY);

  currentY += 4;
  doc.setFont("helvetica", "bold");
  doc.text("Mobile: ", leftX, currentY);
  doc.setFont("helvetica", "normal");
  doc.text(val(data.customerMobile), leftX + 18, currentY);

  if (data.customerWhatsapp && data.customerWhatsapp.trim()) {
    currentY += 4;
    doc.setFont("helvetica", "bold");
    doc.text("WhatsApp: ", leftX, currentY);
    doc.setFont("helvetica", "normal");
    doc.text(val(data.customerWhatsapp), leftX + 18, currentY);
  }

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

  // Right Column: Quotation Meta & Shipping
  currentY = boxStartY;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(accentColor);
  doc.text("QUOTATION INFO & SHIPPING", rightX, currentY);

  currentY += 4;
  doc.setFontSize(8.5);
  doc.setTextColor(textColor);

  const renderMeta = (label: string, value: string, yPos: number) => {
    doc.setFont("helvetica", "bold");
    doc.text(`${label}: `, rightX, yPos);
    doc.setFont("helvetica", "normal");
    const splitVal = doc.splitTextToSize(value, colWidth - 26);
    doc.text(splitVal, rightX + 26, yPos);
    return Math.max(3.8, splitVal.length * 3.5);
  };

  currentY += renderMeta("Date", formatPdfDate(data.quotationDate), currentY);
  if (data.deliveryType) {
    currentY += renderMeta("Delivery", val(data.deliveryType), currentY);
  }
  if (data.priceCategoryName) {
    currentY += renderMeta("Price Tier", val(data.priceCategoryName), currentY);
  }

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
  currentY = boxStartY + Math.max(leftBoxHeight, rightBoxHeight) + 6;

  // ── Products & Artwork Table ──────────────────────────────────────────
  checkPageBreak(30);

  doc.setFontSize(9.5);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(navyColor);
  doc.text("ITEMS & ARTWORK SPECIFICATIONS", margin, currentY);

  currentY += 4;

  const drawTableHeader = () => {
    doc.setFillColor(30, 27, 75); // Dark Navy Header
    doc.rect(margin, currentY, contentWidth, 7.5, "F");
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(255, 255, 255);

    doc.text("#", margin + 3.5, currentY + 5, { align: "center" });
    doc.text("Item / Artwork Details", margin + 10, currentY + 5);
    doc.text("Qty", margin + 115, currentY + 5, { align: "center" });
    doc.text("Unit Price", margin + 138, currentY + 5, { align: "right" });
    doc.text("Addl Amt", margin + 158, currentY + 5, { align: "right" });
    doc.text("Amount", margin + 180, currentY + 5, { align: "right" });
    currentY += 7.5;
  };

  drawTableHeader();

  enrichedItems.forEach((proj: any, idx: number) => {
    const pName = val(proj.productName || proj.project_name);
    const qty = Number(proj.quantity) || 1;
    const unitPrice = formatPdfCurrency(proj.unitPrice ?? proj.unit_price);
    const addlAmt = formatPdfCurrency(proj.additionalAmount ?? proj.additional_amount ?? 0);
    const amt = formatPdfCurrency(proj.amount ?? ((Number(proj.quantity) || 1) * (Number(proj.unitPrice || proj.unit_price) || 0) + (Number(proj.additionalAmount || proj.additional_amount) || 0)));
    const meta = proj._meta || extractProjectImageMeta(proj);

    const hasImage = Boolean(meta.base64);
    const thumbSize = 13; // 13mm x 13mm
    const thumbX = margin + 9;
    const textStartX = hasImage ? thumbX + thumbSize + 3 : margin + 9;
    const textAvailableWidth = hasImage ? 76 : 94;

    const wrappedName = doc.splitTextToSize(pName, textAvailableWidth);

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

    // Thumbnail Image
    if (hasImage && meta.base64) {
      const thumbY = currentY + (rowHeight - thumbSize) / 2;
      try {
        doc.addImage(meta.base64, "JPEG", thumbX, thumbY, thumbSize, thumbSize);
        doc.setDrawColor(203, 213, 225);
        doc.setLineWidth(0.3);
        doc.roundedRect(thumbX, thumbY, thumbSize, thumbSize, 1, 1, "S");
      } catch (e) {
        console.warn("jsPDF could not add image:", e);
      }
    }

    // Details Text
    let lineY = currentY + 4;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(textColor);
    doc.text(wrappedName, textStartX, lineY);
    lineY += wrappedName.length * 3.8;

    // Code & Category Line
    if (meta.code || meta.category) {
      doc.setFontSize(7.5);
      if (meta.code) {
        doc.setFont("helvetica", "bold");
        doc.setTextColor(accentColor);
        doc.text(`Code: #${meta.code}`, textStartX, lineY);
        const codeWidth = doc.getTextWidth(`Code: #${meta.code}`);
        if (meta.category) {
          doc.setFont("helvetica", "normal");
          doc.setTextColor(secondaryColor);
          doc.text(` | Cat: ${meta.category}`, textStartX + codeWidth, lineY);
        }
      } else if (meta.category) {
        doc.setFont("helvetica", "normal");
        doc.setTextColor(secondaryColor);
        doc.text(`Category: ${meta.category}`, textStartX, lineY);
      }
      lineY += 3.5;
    }

    // Artwork Name Line
    if (meta.name) {
      doc.setFontSize(7);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(secondaryColor);
      const splitArtworkName = doc.splitTextToSize(`Artwork: ${meta.name}`, textAvailableWidth);
      doc.text(splitArtworkName, textStartX, lineY);
      lineY += splitArtworkName.length * 3.2;
    }

    // Qty
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(textColor);
    doc.text(`${qty}`, margin + 115, midY, { align: "center" });

    // Financials
    doc.setFont("helvetica", "normal");
    doc.text(unitPrice, margin + 138, midY, { align: "right" });
    doc.text(addlAmt, margin + 158, midY, { align: "right" });
    doc.setFont("helvetica", "bold");
    doc.text(amt, margin + 180, midY, { align: "right" });
    doc.setFont("helvetica", "normal");

    currentY += rowHeight;
  });

  currentY += 6;

  // ── Financials Summary Box ──────────────────────────────────────────
  checkPageBreak(32);

  const summaryBoxWidth = 72;
  const summaryBoxX = margin + contentWidth - summaryBoxWidth;

  doc.setFillColor(lightGray);
  doc.setDrawColor(borderGray);
  doc.roundedRect(summaryBoxX, currentY, summaryBoxWidth, 24, 1.5, 1.5, "FD");

  let summaryY = currentY + 5;
  doc.setFontSize(8.5);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(secondaryColor);
  doc.text("Sub Total:", summaryBoxX + 4, summaryY);
  doc.setTextColor(textColor);
  doc.text(formatPdfCurrency(data.subTotal), summaryBoxX + summaryBoxWidth - 4, summaryY, { align: "right" });

  summaryY += 5.5;
  doc.setTextColor(secondaryColor);
  doc.text("Discount:", summaryBoxX + 4, summaryY);
  if (data.discount > 0) {
    doc.setTextColor("#b91c1c"); // Red for discount
    doc.text(`- ${formatPdfCurrency(data.discount)}`, summaryBoxX + summaryBoxWidth - 4, summaryY, { align: "right" });
  } else {
    doc.setTextColor(textColor);
    doc.text("Rs. 0.00", summaryBoxX + summaryBoxWidth - 4, summaryY, { align: "right" });
  }

  summaryY += 6.5;
  doc.setDrawColor(borderGray);
  doc.line(summaryBoxX + 4, summaryY - 2, summaryBoxX + summaryBoxWidth - 4, summaryY - 2);

  doc.setFontSize(9.5);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(accentColor);
  doc.text("Final Total:", summaryBoxX + 4, summaryY + 2);
  doc.text(formatPdfCurrency(data.finalAmount), summaryBoxX + summaryBoxWidth - 4, summaryY + 2, { align: "right" });

  currentY += 28;

  // ── Remarks Section ─────────────────────────────────────────────────
  const rawRemarks = data.remarks || "";
  const cleanRemarks = rawRemarks.replace(/\[PDF_URL\]:\s*https?:\/\/[^\s]+/gi, "").trim();

  if (cleanRemarks && cleanRemarks !== "null") {
    checkPageBreak(20);

    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(navyColor);
    doc.text("SPECIAL REMARKS & TERMS", margin, currentY);

    currentY += 3.5;
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(textColor);

    const wrappedRemarks = doc.splitTextToSize(cleanRemarks, contentWidth - 8);
    const remarksHeight = wrappedRemarks.length * 3.8 + 4;

    doc.setFillColor(lightGray);
    doc.setDrawColor(borderGray);
    doc.roundedRect(margin, currentY, contentWidth, remarksHeight, 1.5, 1.5, "FD");

    doc.text(wrappedRemarks, margin + 4, currentY + 4);
    currentY += remarksHeight + 5;
  }

  // ── Footer & Page Numbers ───────────────────────────────────────────
  const pageCount = (doc as any).getNumberOfPages ? (doc as any).getNumberOfPages() : 1;
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184);
    doc.setDrawColor(226, 232, 240);
    doc.line(margin, 282, margin + contentWidth, 282);

    doc.text("Amaze ERP • Thank you for your business! This is a system-generated quotation document.", margin, 286);
    doc.text(`Page ${i} of ${pageCount}`, margin + contentWidth, 286, { align: "right" });
  }

  // Trigger Safe Download
  const outFileName = data.fileName || `Quotation-${data.quotationNumber || "Document"}.pdf`;
  const pdfBlob = doc.output("blob");
  const blobUrl = URL.createObjectURL(pdfBlob);

  const downloadLink = document.createElement("a");
  downloadLink.href = blobUrl;
  downloadLink.download = outFileName;
  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);
  URL.revokeObjectURL(blobUrl);
}
