
export interface ExportResult {
  id: string;
  table: string;
  format: 'csv' | 'json' | 'pdf';
  fileName: string;
  downloadUrl: string;
  recordCount: number;
  timestamp: Date;
  status: 'success' | 'error' | 'processing';
  duration: number;
  error?: string;
}
