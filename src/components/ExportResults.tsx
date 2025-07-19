
import { Download, CheckCircle, XCircle, Clock, FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ExportResult } from '@/types/export';

interface ExportResultsProps {
  results: ExportResult[];
}

const ExportResults = ({ results }: ExportResultsProps) => {
  if (results.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Export Results</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No exports yet. Start by exporting some data above.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const handleDownload = (result: ExportResult) => {
    if (result.downloadUrl) {
      const link = document.createElement('a');
      link.href = result.downloadUrl;
      link.download = result.fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return <Clock className="h-5 w-5 text-yellow-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'text-green-600';
      case 'error':
        return 'text-red-600';
      default:
        return 'text-yellow-600';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Export Results</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {results.map((result) => (
            <div
              key={result.id}
              className="flex items-center justify-between p-4 border border-border rounded-lg bg-card"
            >
              <div className="flex items-center space-x-4">
                {getStatusIcon(result.status)}
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-foreground">
                      {result.table} ({result.format.toUpperCase()})
                    </span>
                    <span className={`text-sm ${getStatusColor(result.status)}`}>
                      {result.status}
                    </span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {result.status === 'success' ? (
                      <>
                        {result.recordCount} records exported in {formatDuration(result.duration)}
                        <br />
                        {result.timestamp.toLocaleString()}
                      </>
                    ) : (
                      <>
                        Failed after {formatDuration(result.duration)}
                        <br />
                        {result.error}
                      </>
                    )}
                  </div>
                </div>
              </div>
              
              {result.status === 'success' && result.downloadUrl && (
                <button
                  onClick={() => handleDownload(result)}
                  className="flex items-center space-x-2 px-3 py-2 bg-secondary text-secondary-foreground hover:bg-secondary/80 rounded-md transition-colors"
                >
                  <Download className="h-4 w-4" />
                  <span>Download</span>
                </button>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ExportResults;
