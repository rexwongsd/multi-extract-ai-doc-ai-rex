import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { ExtractionResult, ExtractionResponse } from '@/types/extraction';
import { Loader2, Upload, FileText, Sparkles } from 'lucide-react';

interface ExtractionFormProps {
  onExtract: (result: ExtractionResult) => void;
}

const ExtractionForm = ({ onExtract }: ExtractionFormProps) => {
  const [text, setText] = useState('');
  const [isExtracting, setIsExtracting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Handle text files
    if (file.type === 'text/plain' || file.name.endsWith('.txt') || file.name.endsWith('.csv')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        setText(content);
      };
      reader.readAsText(file);
    } else {
      setError('Currently supports .txt and .csv files. For other formats, please paste the text content.');
    }
  };

  const handleExtract = async () => {
    if (!text.trim()) {
      setError('Please enter or upload text to extract names from.');
      return;
    }

    setIsExtracting(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke<ExtractionResponse>('extract-names', {
        body: { text: text.trim() }
      });

      if (fnError) {
        throw new Error(fnError.message || 'Extraction failed');
      }

      if (!data?.success) {
        throw new Error(data?.error || 'Extraction failed');
      }

      if (data.data) {
        onExtract(data.data);
      }
    } catch (err) {
      console.error('Extraction error:', err);
      setError(err instanceof Error ? err.message : 'Failed to extract names. Please try again.');
    } finally {
      setIsExtracting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          AI Name Extraction
        </CardTitle>
        <CardDescription>
          Extract person names and company names from text. Supports Chinese names (e.g., WONG AH MOI, Won Hai), 
          Malay, Indian, and Western names.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Upload File or Paste Text</label>
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="relative"
              disabled={isExtracting}
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload File
              <input
                type="file"
                accept=".txt,.csv"
                onChange={handleFileUpload}
                className="absolute inset-0 opacity-0 cursor-pointer"
                disabled={isExtracting}
              />
            </Button>
            <span className="text-sm text-muted-foreground self-center">
              Supports .txt and .csv files
            </span>
          </div>
        </div>

        <div className="space-y-2">
          <Textarea
            placeholder="Paste your text here containing names and company names to extract...

Example:
Invoice to: WONG AH MOI
Company: ABC TRADING SDN BHD
Contact: TAN KIM HOCK
CC: LEE CHEE KEONG, Won Hai"
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              setError(null);
            }}
            rows={10}
            className="font-mono text-sm"
            disabled={isExtracting}
          />
        </div>

        {error && (
          <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md text-sm text-destructive">
            {error}
          </div>
        )}

        <Button
          onClick={handleExtract}
          disabled={isExtracting || !text.trim()}
          className="w-full"
        >
          {isExtracting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Extracting Names...
            </>
          ) : (
            <>
              <FileText className="h-4 w-4 mr-2" />
              Extract Names & Companies
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default ExtractionForm;
