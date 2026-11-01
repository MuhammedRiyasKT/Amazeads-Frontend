"use client";

import React, { useEffect, useState, useRef } from "react";
import { X, FileDown, ExternalLink, Loader2, AlertCircle, FileText, RefreshCw } from "lucide-react";
import { getProductionOrderPdfBlob, ProductionOrderPdfResult } from "../utils/productionOrderPdf";
import { UserRole } from "../services/managerOrder.service";

interface ProductionOrderPdfPreviewModalProps {
  isOpen: boolean;
  orderId: number | null;
  orderNumber?: string;
  role?: UserRole;
  onClose: () => void;
}

export default function ProductionOrderPdfPreviewModal({
  isOpen,
  orderId,
  orderNumber,
  role = "project-manager",
  onClose,
}: ProductionOrderPdfPreviewModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pdfData, setPdfData] = useState<ProductionOrderPdfResult | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  // Keep track of active blob url for cleanup
  const currentBlobUrlRef = useRef<string | null>(null);

  const cleanupBlob = () => {
    if (currentBlobUrlRef.current) {
      URL.revokeObjectURL(currentBlobUrlRef.current);
      currentBlobUrlRef.current = null;
    }
  };

  const handleClose = () => {
    cleanupBlob();
    setPdfData(null);
    setError(null);
    onClose();
  };

  const loadPdf = async () => {
    if (!orderId) return;
    setIsLoading(true);
    setError(null);
    cleanupBlob();
    setPdfData(null);

    try {
      const result = await getProductionOrderPdfBlob(orderId, orderNumber, role);
      currentBlobUrlRef.current = result.blobUrl;
      setPdfData(result);
    } catch (err: any) {
      console.error("Failed to generate PDF for preview:", err);
      setError(err?.message || "Failed to generate production order PDF preview.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && orderId) {
      loadPdf();
    } else {
      cleanupBlob();
      setPdfData(null);
      setError(null);
    }
    return () => {
      cleanupBlob();
    };
  }, [isOpen, orderId, role]);

  // Handle ESC key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        handleClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  const handleDownload = () => {
    if (!pdfData) return;
    setIsDownloading(true);
    try {
      const downloadLink = document.createElement("a");
      downloadLink.href = pdfData.blobUrl;
      downloadLink.download = pdfData.fileName;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    } catch (err) {
      console.error("Download error:", err);
      // Fallback directly to jsPDF save
      pdfData.doc.save(pdfData.fileName);
    } finally {
      setTimeout(() => setIsDownloading(false), 800);
    }
  };

  const handleOpenInNewTab = () => {
    if (!pdfData?.blobUrl) return;
    window.open(pdfData.blobUrl, "_blank", "noopener,noreferrer");
  };

  if (!isOpen) return null;

  const displayOrderNum = orderNumber || (orderId ? String(orderId) : "—");

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-[2500] p-3 sm:p-5 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl h-[92vh] flex flex-col border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 bg-slate-50/80 shrink-0">
          {/* Left Title & Badge */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-100/80 border border-indigo-200 flex items-center justify-center text-indigo-700 shadow-2xs">
              <FileText size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-800 text-sm tracking-wide">
                  Production Order Preview
                </h3>
                <span className="bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs font-semibold px-2 py-0.5 rounded-full">
                  #{displayOrderNum}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block">
                Review document details, artwork specifications, and checklists before downloading.
              </p>
            </div>
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2">
            {pdfData && (
              <>
                <button
                  type="button"
                  onClick={handleOpenInNewTab}
                  className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 transition-colors cursor-pointer shadow-2xs"
                  title="Open in new window"
                >
                  <ExternalLink size={13} />
                  <span>Open in Tab</span>
                </button>

                <button
                  type="button"
                  onClick={handleDownload}
                  disabled={isDownloading}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 transition-all cursor-pointer shadow-sm hover:shadow"
                  title="Download PDF"
                >
                  {isDownloading ? (
                    <Loader2 size={13} className="animate-spin" />
                  ) : (
                    <FileDown size={14} />
                  )}
                  <span>Download PDF</span>
                </button>
              </>
            )}

            <button
              type="button"
              onClick={handleClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
              title="Close (Esc)"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 w-full h-full relative bg-slate-100 flex flex-col overflow-hidden">
          {isLoading && (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-slate-50">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center mb-3">
                <Loader2 className="animate-spin text-indigo-600" size={26} />
              </div>
              <h4 className="text-sm font-bold text-slate-800">
                Generating Production Order PDF
              </h4>
              <p className="text-xs text-slate-500 mt-1 max-w-sm">
                Fetching artwork thumbnails, department assignments, and compiling print layout...
              </p>
            </div>
          )}

          {!isLoading && error && (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-slate-50">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center mb-3 text-rose-600">
                <AlertCircle size={26} />
              </div>
              <h4 className="text-sm font-bold text-slate-800">
                Unable to Generate Preview
              </h4>
              <p className="text-xs text-rose-600 mt-1 max-w-md bg-rose-50/70 p-2.5 rounded-lg border border-rose-100">
                {error}
              </p>
              <button
                type="button"
                onClick={loadPdf}
                className="mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 transition-colors cursor-pointer shadow-2xs"
              >
                <RefreshCw size={13} />
                <span>Try Again</span>
              </button>
            </div>
          )}

          {!isLoading && !error && pdfData && (
            <iframe
              src={`${pdfData.blobUrl}#toolbar=1`}
              className="w-full h-full border-0"
              title={`Production Order #${displayOrderNum}`}
            >
              <div className="p-8 text-center bg-white h-full flex flex-col items-center justify-center">
                <p className="text-sm text-slate-600 mb-3">
                  Your browser does not support embedded PDF preview.
                </p>
                <button
                  type="button"
                  onClick={handleDownload}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 cursor-pointer"
                >
                  <FileDown size={14} />
                  <span>Download PDF Document</span>
                </button>
              </div>
            </iframe>
          )}
        </div>
      </div>
    </div>
  );
}
