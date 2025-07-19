
import { useState } from 'react';
import { Download, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { ExportResult } from '@/types/export';
import { exportToCSV, exportToJSON, exportToPDF } from '@/utils/exportUtils';

interface ExportButtonProps {
  table: string;
  format: 'csv' | 'json' | 'pdf';
  onExportComplete: (result: ExportResult) => void;
  disabled?: boolean;
}

const ExportButton = ({ table, format, onExportComplete, disabled }: ExportButtonProps) => {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    if (disabled) return;
    
    setIsExporting(true);
    const startTime = Date.now();

    try {
      console.log(`Starting ${format.toUpperCase()} export for ${table}`);
      
      // Fetch data from Supabase
      const { data, error } = await supabase.from(table).select('*');
      
      if (error) {
        throw new Error(`Failed to fetch ${table}: ${error.message}`);
      }

      if (!data || data.length === 0) {
        throw new Error(`No data found in ${table}`);
      }

      let fileName: string;
      let downloadUrl: string;

      // Export based on format
      switch (format) {
        case 'csv':
          ({ fileName, downloadUrl } = exportToCSV(data, table));
          break;
        case 'json':
          ({ fileName, downloadUrl } = exportToJSON(data, table));
          break;
        case 'pdf':
          ({ fileName, downloadUrl } = exportToPDF(data, table));
          break;
        default:
          throw new Error(`Unsupported format: ${format}`);
      }

      const duration = Date.now() - startTime;
      
      const result: ExportResult = {
        id: `${table}-${format}-${Date.now()}`,
        table,
        format,
        fileName,
        downloadUrl,
        recordCount: data.length,
        timestamp: new Date(),
        status: 'success',
        duration,
      };

      console.log(`Export completed successfully:`, result);
      onExportComplete(result);

    } catch (error) {
      console.error(`Export failed:`, error);
      
      const duration = Date.now() - startTime;
      const result: ExportResult = {
        id: `${table}-${format}-${Date.now()}`,
        table,
        format,
        fileName: '',
        downloadUrl: '',
        recordCount: 0,
        timestamp: new Date(),
        status: 'error',
        duration,
        error: error instanceof Error ? error.message : 'Unknown error',
      };

      onExportComplete(result);
    } finally {
      setIsExporting(false);
    }
  };

  const formatLabels = {
    csv: 'CSV',
    json: 'JSON',
    pdf: 'PDF',
  };

  return (
    <button
      onClick={handleExport}
      disabled={disabled || isExporting}
      className={`
        flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors
        ${disabled 
          ? 'bg-muted text-muted-foreground cursor-not-allowed' 
          : isExporting
            ? 'bg-muted text-muted-foreground cursor-wait'
            : 'bg-primary text-primary-foreground hover:bg-primary/90'
        }
      `}
    >
      {isExporting ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Download className="h-4 w-4" />
      )}
      <span>
        {isExporting ? 'Exporting...' : `Export ${formatLabels[format]}`}
      </span>
    </button>
  );
};

export default ExportButton;
