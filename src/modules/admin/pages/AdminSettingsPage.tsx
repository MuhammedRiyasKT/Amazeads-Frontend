"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Settings,
  ShieldAlert,
  HardDrive,
  Database,
  Download,
  Trash2,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  Upload,
  RefreshCw,
  ExternalLink,
  Info,
  Copy,
  Check,
} from "lucide-react";
import Button from "@/components/ui/Button";
import { useAuthStore } from "@/store/authStore";
import {
  deleteImagesByDateRange,
  deleteImage,
  replaceImage,
  uploadImage,
  resolveFullImageUrl,
} from "@/services/image.service";
import { downloadDatabaseBackup, BackupFormat } from "@/services/backup.service";
import {
  DeleteImagesByDateRangeResponse,
  ImageUploadResponse,
} from "@/types/imageManagement";

export default function AdminSettingsPage() {
  const router = useRouter();
  const { user, _hasHydrated } = useAuthStore();

  // Active tab state
  const [activeTab, setActiveTab] = useState<"backup" | "storage" | "system">("backup");

  // Database Backup States
  const [backupFormat, setBackupFormat] = useState<BackupFormat>("dump");
  const [isDownloadingBackup, setIsDownloadingBackup] = useState(false);
  const [backupSuccess, setBackupSuccess] = useState<string | null>(null);
  const [backupError, setBackupError] = useState<string | null>(null);

  // Date Range Cleanup States
  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");
  const [isDeletingRange, setIsDeletingRange] = useState(false);
  const [rangeResult, setRangeResult] = useState<DeleteImagesByDateRangeResponse | null>(null);
  const [rangeError, setRangeError] = useState<string | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Single Image Action States
  const [singleFilename, setSingleFilename] = useState("");
  const [singleFolder, setSingleFolder] = useState<"images" | "image_codes">("images");
  const [isDeletingSingle, setIsDeletingSingle] = useState(false);
  const [singleActionMessage, setSingleActionMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Single Image Replace State
  const [replaceFile, setReplaceFile] = useState<File | null>(null);
  const [isReplacing, setIsReplacing] = useState(false);

  // Test Upload State
  const [testFile, setTestFile] = useState<File | null>(null);
  const [testFolder, setTestFolder] = useState<"images" | "image_codes">("images");
  const [isTestingUpload, setIsTestingUpload] = useState(false);
  const [testResult, setTestResult] = useState<ImageUploadResponse | null>(null);
  const [testError, setTestError] = useState<string | null>(null);
  const [copiedUrl, setCopiedUrl] = useState(false);

  // Helper to extract clean error message
  const extractError = (err: any): string => {
    const detail = err?.response?.data?.detail;
    const msg = err?.response?.data?.message;
    if (typeof detail === "string") return detail;
    if (Array.isArray(detail)) {
      return detail
        .map((d: any) => (typeof d === "string" ? d : d?.msg || JSON.stringify(d)))
        .join(", ");
    }
    if (typeof msg === "string") return msg;
    if (err?.message) return err.message;
    return "Operation failed. Please verify the parameters and try again.";
  };

  // Quick preset helper
  const handleSetPreset = (daysAgo: number) => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - daysAgo);

    const formatYMD = (d: Date) => d.toISOString().split("T")[0];
    setFromDate(formatYMD(start));
    setToDate(formatYMD(end));
    setRangeError(null);
  };

  // Trigger Date-Range Delete
  const handleConfirmDateRangeDelete = async () => {
    setShowConfirmModal(false);
    if (!fromDate || !toDate) {
      setRangeError("Please specify both From Date and To Date.");
      return;
    }

    if (fromDate > toDate) {
      setRangeError("From Date cannot be later than To Date.");
      return;
    }

    setIsDeletingRange(true);
    setRangeError(null);
    setRangeResult(null);

    try {
      const res = await deleteImagesByDateRange({
        from_date: fromDate,
        to_date: toDate,
      });
      setRangeResult(res);
    } catch (err: any) {
      console.error("Bulk delete error:", err);
      setRangeError(extractError(err));
    } finally {
      setIsDeletingRange(false);
    }
  };

  // Single Image Delete
  const handleDeleteSingle = async () => {
    const trimmed = singleFilename.trim();
    if (!trimmed) {
      setSingleActionMessage({
        type: "error",
        text: "Please enter a valid filename to delete.",
      });
      return;
    }

    setIsDeletingSingle(true);
    setSingleActionMessage(null);

    try {
      const res = await deleteImage(trimmed, { folder: singleFolder });
      setSingleActionMessage({
        type: "success",
        text: res.message || `File '${trimmed}' successfully deleted from '${singleFolder}'.`,
      });
      setSingleFilename("");
    } catch (err: any) {
      setSingleActionMessage({
        type: "error",
        text: extractError(err),
      });
    } finally {
      setIsDeletingSingle(false);
    }
  };

  // Single Image Replace
  const handleReplaceSingle = async () => {
    const trimmed = singleFilename.trim();
    if (!trimmed) {
      setSingleActionMessage({
        type: "error",
        text: "Please enter the target filename you wish to replace.",
      });
      return;
    }
    if (!replaceFile) {
      setSingleActionMessage({
        type: "error",
        text: "Please select a replacement image file.",
      });
      return;
    }

    setIsReplacing(true);
    setSingleActionMessage(null);

    try {
      const res = await replaceImage(trimmed, replaceFile, { folder: singleFolder });
      setSingleActionMessage({
        type: "success",
        text: `Successfully replaced '${trimmed}'. New URL: ${res.image_url}`,
      });
      setReplaceFile(null);
    } catch (err: any) {
      setSingleActionMessage({
        type: "error",
        text: extractError(err),
      });
    } finally {
      setIsReplacing(false);
    }
  };

  // Test Image Upload
  const handleTestUpload = async () => {
    if (!testFile) return;

    setIsTestingUpload(true);
    setTestError(null);
    setTestResult(null);

    try {
      const res = await uploadImage(testFile, { folder: testFolder });
      setTestResult(res);
    } catch (err: any) {
      setTestError(extractError(err));
    } finally {
      setIsTestingUpload(false);
    }
  };

  // Copy URL Helper
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  // Database Backup Download
  const handleDownloadBackup = async () => {
    setIsDownloadingBackup(true);
    setBackupSuccess(null);
    setBackupError(null);

    try {
      const filename = await downloadDatabaseBackup(backupFormat);
      setBackupSuccess(`Backup file "${filename}" generated and downloaded successfully.`);
    } catch (err: any) {
      console.error("Backup download failed:", err);
      setBackupError(extractError(err));
    } finally {
      setIsDownloadingBackup(false);
    }
  };

  // Auth & Hydration Check
  if (!_hasHydrated) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
          <p className="text-xs font-semibold text-slate-500">
            Checking administrative permissions...
          </p>
        </div>
      </div>
    );
  }

  const isAdmin = user?.role_name?.toLowerCase() === "admin";
  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] p-6">
        <div className="bg-white border border-red-200 rounded-2xl shadow-sm p-8 max-w-md w-full text-center">
          <div className="w-14 h-14 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShieldAlert size={28} />
          </div>
          <h2 className="text-lg font-bold text-slate-900 mb-1">Access Restricted</h2>
          <p className="text-xs text-slate-500 leading-relaxed mb-6">
            This settings area is restricted to system administrators. Your current role is{" "}
            <span className="font-semibold text-slate-700 capitalize">
              {user?.role_name || "Guest"}
            </span>
            .
          </p>
          <Button
            variant="outline"
            size="md"
            className="w-full"
            onClick={() => router.back()}
          >
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Settings size={20} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">Admin Settings</h1>
              <p className="text-xs text-slate-500">
                System configuration, storage cleanup, and shared image management.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            Admin Access Verified
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-2">
        <button
          type="button"
          onClick={() => setActiveTab("backup")}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 flex items-center gap-2 transition-colors cursor-pointer ${
            activeTab === "backup"
              ? "border-indigo-600 text-indigo-600"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Database size={15} />
          Database Backup
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("storage")}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 flex items-center gap-2 transition-colors cursor-pointer ${
            activeTab === "storage"
              ? "border-indigo-600 text-indigo-600"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <HardDrive size={15} />
          Image & Storage Management
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("system")}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 flex items-center gap-2 transition-colors cursor-pointer ${
            activeTab === "system"
              ? "border-indigo-600 text-indigo-600"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Info size={15} />
          System Info
        </button>
      </div>

      {/* TAB CONTENT: DATABASE BACKUP */}
      {activeTab === "backup" && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-sm">
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4 mb-5">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-slate-900">
                    PostgreSQL Database Backup
                  </h2>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded border border-indigo-100">
                    Admin Exclusive
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Downloads a live snapshot of the PostgreSQL database. Safely backup all system records including Orders, Customers, Accounts, Products, and Staff details.
                </p>
              </div>
            </div>

            <div className="space-y-5">
              {/* Format selection cards */}
              <div>
                <label className="text-xs font-bold text-slate-600 uppercase block mb-3">
                  Select Backup Format *
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Option 1: .dump */}
                  <div
                    onClick={() => setBackupFormat("dump")}
                    className={`border-2 rounded-xl p-4 cursor-pointer transition-all ${
                      backupFormat === "dump"
                        ? "border-indigo-600 bg-indigo-50/20 shadow-xs"
                        : "border-slate-200 hover:border-slate-300 bg-white"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-indigo-100 text-indigo-700">
                          .dump
                        </span>
                        <span className="text-xs font-bold text-slate-800">
                          PostgreSQL Custom Archive
                        </span>
                      </div>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        Recommended
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      Genuine PostgreSQL custom archive (.dump). Fully compatible with <b>pgAdmin</b> and <b>pg_restore</b>. Best for full database disaster recovery and migrations.
                    </p>
                  </div>

                  {/* Option 2: .sql */}
                  <div
                    onClick={() => setBackupFormat("sql")}
                    className={`border-2 rounded-xl p-4 cursor-pointer transition-all ${
                      backupFormat === "sql"
                        ? "border-indigo-600 bg-indigo-50/20 shadow-xs"
                        : "border-slate-200 hover:border-slate-300 bg-white"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                          .sql
                        </span>
                        <span className="text-xs font-bold text-slate-800">
                          Plain SQL Script
                        </span>
                      </div>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      Plain text SQL statements. Can be opened in any text editor and executed directly against any PostgreSQL instance.
                    </p>
                  </div>
                </div>
              </div>

              {/* Storage & Memory Notice */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-start gap-3">
                <Info size={16} className="text-slate-500 shrink-0 mt-0.5" />
                <div className="text-xs text-slate-600 space-y-1">
                  <p>
                    <b>Automatic Cleanup:</b> The dump is generated temporarily in the server system memory (<code className="font-mono text-indigo-600 bg-white px-1 py-0.5 rounded border border-slate-200">/tmp</code>) and is automatically deleted immediately after delivery. No files are stored in project folders.
                  </p>
                </div>
              </div>

              {/* Download Button */}
              <div className="pt-2">
                <Button
                  variant="primary"
                  size="md"
                  onClick={handleDownloadBackup}
                  disabled={isDownloadingBackup}
                  className="gap-2"
                >
                  {isDownloadingBackup ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Generating & Downloading Backup ({backupFormat.toUpperCase()})...
                    </>
                  ) : (
                    <>
                      <Download size={16} />
                      Download Database Backup ({backupFormat === "dump" ? ".dump" : ".sql"})
                    </>
                  )}
                </Button>
              </div>

              {/* Feedback Notifications */}
              {backupSuccess && (
                <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                  <span>{backupSuccess}</span>
                </div>
              )}

              {backupError && (
                <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
                  <AlertTriangle size={16} className="text-red-600 shrink-0" />
                  <span>{backupError}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: STORAGE & IMAGE MANAGEMENT */}
      {activeTab === "storage" && (
        <div className="space-y-6">
          {/* Section 1: Bulk Image Cleanup */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-sm">
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4 mb-5">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-slate-900">
                    Bulk Server Storage Cleanup
                  </h2>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-red-50 text-red-600 rounded border border-red-100">
                    Irreversible
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Deletes all images saved between the selected dates strictly from the{" "}
                  <code className="text-indigo-600 bg-indigo-50 px-1 py-0.5 rounded font-mono">
                    images
                  </code>{" "}
                  folder on the server.
                </p>
              </div>
            </div>

            {/* Date Pickers & Presets */}
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 items-end">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-600 uppercase">
                    From Date (Inclusive) *
                  </label>
                  <input
                    type="date"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                    className="h-10 border border-slate-200 rounded-lg px-3 text-xs font-semibold focus:outline-none focus:border-indigo-600 bg-white"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-600 uppercase">
                    To Date (Inclusive) *
                  </label>
                  <input
                    type="date"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                    className="h-10 border border-slate-200 rounded-lg px-3 text-xs font-semibold focus:outline-none focus:border-indigo-600 bg-white"
                  />
                </div>

                <div>
                  <Button
                    variant="danger"
                    size="md"
                    className="w-full"
                    onClick={() => {
                      if (!fromDate || !toDate) {
                        setRangeError("Please select both dates.");
                        return;
                      }
                      setShowConfirmModal(true);
                    }}
                    disabled={isDeletingRange || !fromDate || !toDate}
                  >
                    {isDeletingRange ? (
                      <>
                        <Loader2 size={15} className="animate-spin" />
                        Deleting...
                      </>
                    ) : (
                      <>
                        <Trash2 size={15} />
                        Delete Images in Range
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {/* Quick Preset Buttons */}
              <div className="flex items-center gap-2 pt-1 flex-wrap">
                <span className="text-xs text-slate-400 font-medium">Quick Presets:</span>
                <button
                  type="button"
                  onClick={() => handleSetPreset(30)}
                  className="px-2.5 py-1 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors cursor-pointer"
                >
                  Last 30 Days
                </button>
                <button
                  type="button"
                  onClick={() => handleSetPreset(60)}
                  className="px-2.5 py-1 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors cursor-pointer"
                >
                  Last 60 Days
                </button>
                <button
                  type="button"
                  onClick={() => handleSetPreset(90)}
                  className="px-2.5 py-1 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors cursor-pointer"
                >
                  Last 90 Days
                </button>
              </div>

              {/* Range Error */}
              {rangeError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg flex items-center gap-2">
                  <AlertTriangle size={16} className="shrink-0" />
                  <span>{rangeError}</span>
                </div>
              )}

              {/* Range Success Result */}
              {rangeResult && (
                <div className="mt-4 p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 size={18} className="text-emerald-600" />
                      <span className="text-xs font-bold text-emerald-900">
                        Cleanup Completed: {rangeResult.deleted_count} file(s) deleted from '
                        {rangeResult.folder}' folder
                      </span>
                    </div>
                    <span className="text-[11px] text-emerald-700 font-medium">
                      {rangeResult.from_date} to {rangeResult.to_date}
                    </span>
                  </div>

                  {rangeResult.deleted_files && rangeResult.deleted_files.length > 0 && (
                    <div className="max-h-48 overflow-y-auto border border-emerald-200/60 rounded-lg bg-white">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 text-slate-500 border-b border-slate-100">
                          <tr>
                            <th className="p-2 font-bold">Filename</th>
                            <th className="p-2 font-bold">Folder</th>
                            <th className="p-2 font-bold">File Date</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {rangeResult.deleted_files.map((file, idx) => (
                            <tr key={idx} className="hover:bg-slate-50/50">
                              <td className="p-2 font-mono text-[11px] text-slate-700">
                                {file.filename}
                              </td>
                              <td className="p-2 text-slate-500">{file.folder}</td>
                              <td className="p-2 text-slate-500">{file.file_date}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Section 2: Single Image Actions (Delete / Replace) */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-sm">
            <div className="border-b border-slate-100 pb-4 mb-5">
              <h2 className="text-base font-bold text-slate-900">
                Single Image Actions (Delete or Replace)
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Perform direct operations on individual server images by specifying their exact filename.
              </p>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-600 uppercase">
                    Target Filename *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 2026-11-04_product_sample.jpg"
                    value={singleFilename}
                    onChange={(e) => setSingleFilename(e.target.value)}
                    className="h-10 border border-slate-200 rounded-lg px-3 text-xs font-mono focus:outline-none focus:border-indigo-600 bg-white"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-600 uppercase">
                    Target Folder
                  </label>
                  <select
                    value={singleFolder}
                    onChange={(e) =>
                      setSingleFolder(e.target.value as "images" | "image_codes")
                    }
                    className="h-10 border border-slate-200 rounded-lg px-3 text-xs font-bold focus:outline-none focus:border-indigo-600 bg-white cursor-pointer"
                  >
                    <option value="images">images (Default)</option>
                    <option value="image_codes">image_codes (Product codes)</option>
                  </select>
                </div>
              </div>

              {/* Action Buttons Row */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
                <Button
                  variant="danger"
                  size="sm"
                  onClick={handleDeleteSingle}
                  disabled={isDeletingSingle || !singleFilename.trim()}
                >
                  {isDeletingSingle ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 size={14} />
                      Delete This Image
                    </>
                  )}
                </Button>

                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    id="replaceFileInput"
                    className="hidden"
                    accept="image/*"
                    onChange={(e) => setReplaceFile(e.target.files?.[0] || null)}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    type="button"
                    onClick={() => document.getElementById("replaceFileInput")?.click()}
                  >
                    <RefreshCw size={14} />
                    {replaceFile ? replaceFile.name : "Select Replacement File"}
                  </Button>

                  {replaceFile && (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={handleReplaceSingle}
                      disabled={isReplacing || !singleFilename.trim()}
                    >
                      {isReplacing ? (
                        <>
                          <Loader2 size={14} className="animate-spin" />
                          Replacing...
                        </>
                      ) : (
                        "Confirm Replace"
                      )}
                    </Button>
                  )}
                </div>
              </div>

              {/* Single Action Feedback */}
              {singleActionMessage && (
                <div
                  className={`p-3 text-xs rounded-lg flex items-center gap-2 border ${
                    singleActionMessage.type === "success"
                      ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                      : "bg-red-50 border-red-200 text-red-700"
                  }`}
                >
                  {singleActionMessage.type === "success" ? (
                    <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                  ) : (
                    <AlertTriangle size={16} className="text-red-600 shrink-0" />
                  )}
                  <span>{singleActionMessage.text}</span>
                </div>
              )}
            </div>
          </div>

          {/* Section 3: Test Upload & URL Generator */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-sm">
            <div className="border-b border-slate-100 pb-4 mb-5">
              <h2 className="text-base font-bold text-slate-900">
                Test Image Upload & Inspect Response
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Upload a test image directly to test API connectivity and view the full accessible URL.
              </p>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-600 uppercase">
                    Choose File to Upload
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setTestFile(e.target.files?.[0] || null)}
                    className="block w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-600 hover:file:bg-indigo-100 cursor-pointer"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-600 uppercase">
                    Destination Folder
                  </label>
                  <select
                    value={testFolder}
                    onChange={(e) =>
                      setTestFolder(e.target.value as "images" | "image_codes")
                    }
                    className="h-10 border border-slate-200 rounded-lg px-3 text-xs font-bold focus:outline-none focus:border-indigo-600 bg-white cursor-pointer"
                  >
                    <option value="images">images</option>
                    <option value="image_codes">image_codes</option>
                  </select>
                </div>
              </div>

              <div>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleTestUpload}
                  disabled={isTestingUpload || !testFile}
                >
                  {isTestingUpload ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload size={14} />
                      Upload Test Image
                    </>
                  )}
                </Button>
              </div>

              {testError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg flex items-center gap-2">
                  <AlertTriangle size={16} className="shrink-0" />
                  <span>{testError}</span>
                </div>
              )}

              {testResult && (() => {
                const url =
                  resolveFullImageUrl(testResult) ||
                  resolveFullImageUrl((testResult as any)?.data) ||
                  "";
                const size =
                  testResult.file_size ??
                  (testResult as any).data?.file_size ??
                  (testResult as any).size ??
                  "";
                const contentType =
                  testResult.content_type ||
                  (testResult as any).data?.content_type ||
                  (testResult as any).type ||
                  "";

                return (
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800">
                        Upload Successful!
                      </span>
                      <span className="text-[11px] text-slate-500 font-mono">
                        {size ? `${size} bytes` : ""} {contentType ? `(${contentType})` : ""}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        readOnly
                        value={url}
                        className="flex-1 h-9 px-3 border border-slate-200 rounded-lg text-xs font-mono bg-white text-slate-700 select-all"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(url)}
                        disabled={!url}
                      >
                        {copiedUrl ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                        {copiedUrl ? "Copied" : "Copy"}
                      </Button>
                      {url && (
                        <a
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="h-9 px-3 inline-flex items-center gap-1.5 border border-slate-200 rounded-lg text-xs font-semibold bg-white text-slate-700 hover:bg-slate-50"
                        >
                          <ExternalLink size={14} />
                          Open
                        </a>
                      )}
                    </div>

                    {url && (
                      <div className="w-28 h-28 rounded-lg overflow-hidden border border-slate-200 bg-white">
                        <img
                          src={url}
                          alt="Uploaded preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: SYSTEM INFO */}
      {activeTab === "system" && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-900">System Environment & User Info</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
              <span className="text-slate-400 font-medium block">Current Logged-in Staff</span>
              <span className="font-bold text-slate-800 text-sm">{user?.staff_name}</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
              <span className="text-slate-400 font-medium block">Role</span>
              <span className="font-bold text-indigo-600 text-sm uppercase">{user?.role_name}</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
              <span className="text-slate-400 font-medium block">Email</span>
              <span className="font-bold text-slate-800">{user?.email}</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
              <span className="text-slate-400 font-medium block">API Base URL</span>
              <span className="font-mono text-slate-700">
                {process.env.NEXT_PUBLIC_API_URL || "Default API configured"}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Bulk Delete */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="w-12 h-12 bg-red-50 text-red-600 rounded-full flex items-center justify-center">
              <AlertTriangle size={24} />
            </div>

            <div>
              <h3 className="text-base font-bold text-slate-900">Confirm Storage Cleanup?</h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                You are about to delete all images saved between{" "}
                <span className="font-bold text-slate-800">{fromDate}</span> and{" "}
                <span className="font-bold text-slate-800">{toDate}</span> strictly from the{" "}
                <code className="text-indigo-600 font-mono">images</code> folder. This action cannot be undone.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <Button
                variant="outline"
                size="sm"
                type="button"
                onClick={() => setShowConfirmModal(false)}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                size="sm"
                type="button"
                onClick={handleConfirmDateRangeDelete}
              >
                Yes, Delete Images
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
