import api from "@/lib/axios";

export type BackupFormat = "dump" | "sql";

/**
 * Downloads the current PostgreSQL database backup from the backend.
 * Endpoint: GET /api/v1/admin/backup/download
 *
 * @param format 'dump' (default, pgAdmin/pg_restore compatible) or 'sql' (plain text SQL script)
 */
export async function downloadDatabaseBackup(format: BackupFormat = "dump"): Promise<string> {
  try {
    const response = await api.get("/api/v1/admin/backup/download", {
      params: { format },
      responseType: "blob",
    });

    // Determine filename from Content-Disposition header or fallback to timestamp
    let filename = `amaze_erp_backup_${new Date().toISOString().split("T")[0]}.${
      format === "sql" ? "sql" : "dump"
    }`;

    const disposition = response.headers?.["content-disposition"];
    if (disposition) {
      const match = disposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
      if (match && match[1]) {
        filename = match[1].replace(/['"]/g, "").trim();
      }
    }

    // Trigger file download in browser
    const blob = new Blob([response.data], {
      type: format === "sql" ? "application/sql" : "application/octet-stream",
    });
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);

    return filename;
  } catch (error: any) {
    // When responseType is 'blob', error responses are also Blob objects
    if (error.response?.data instanceof Blob) {
      try {
        const text = await error.response.data.text();
        const json = JSON.parse(text);
        const detail = json?.detail || json?.message;
        if (detail) {
          throw new Error(typeof detail === "string" ? detail : JSON.stringify(detail));
        }
      } catch (parseError: any) {
        if (parseError.message && parseError.message !== error.message) {
          throw parseError;
        }
      }
    }
    throw error;
  }
}
