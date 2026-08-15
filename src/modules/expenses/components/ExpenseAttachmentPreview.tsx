// src/modules/expenses/components/ExpenseAttachmentPreview.tsx

"use client";

import React from "react";
import { X, ExternalLink, Download, FileText } from "lucide-react";

interface ExpenseAttachmentPreviewProps {
  isOpen: boolean;
  onClose: () => void;
  url: string | null;
}

export default function ExpenseAttachmentPreview({
  isOpen,
  onClose,
  url,
}: ExpenseAttachmentPreviewProps) {
  if (!isOpen || !url) return null;

  const isPDF = url.toLowerCase().endsWith(".pdf") || url.includes("/raw/upload/");

  return (
    <div className="fixed inset-0 bg-slate-900/60 z-[3000] flex items-center justify-center p-4">
      {/* Backdrop click close */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Modal Box */}
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[85vh] flex flex-col z-10 border overflow-hidden animate-zoom-in">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b bg-slate-50/50">
          <h3 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider">
            Receipt Attachment Preview
          </h3>
          <div className="flex items-center gap-2">
            <a
              href={url}
              target="_blank"
              rel="noreferrer"
              className="p-1.5 hover:bg-slate-200 rounded-lg text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
              title="Open in new tab"
            >
              <ExternalLink size={15} />
            </a>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 cursor-pointer">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-auto bg-slate-900 p-4 flex items-center justify-center min-h-[300px]">
          {isPDF ? (
            <div className="text-center text-white space-y-4">
              <FileText size={48} className="mx-auto text-slate-400 animate-pulse" />
              <div className="space-y-1">
                <h4 className="font-extrabold text-sm">PDF Document Receipt</h4>
                <p className="text-xs text-slate-400 font-semibold">PDF preview is not supported directly. Please open or download.</p>
              </div>
              <div className="flex justify-center gap-2.5 pt-2">
                <a
                  href={url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition-all cursor-pointer shadow-xs"
                >
                  <ExternalLink size={13} /> Open in Browser
                </a>
                <a
                  href={url}
                  download
                  className="flex items-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-bold transition-all cursor-pointer border border-slate-700"
                >
                  <Download size={13} /> Download File
                </a>
              </div>
            </div>
          ) : (
            <img
              src={url}
              alt="Receipt Attachment"
              className="max-w-full max-h-[70vh] object-contain rounded-sm"
            />
          )}
        </div>
      </div>
    </div>
  );
}
