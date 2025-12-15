import { useState } from 'react';
import ExtractionForm from '@/components/ExtractionForm';
import ExtractionResults from '@/components/ExtractionResults';
import { ExtractionResult } from '@/types/extraction';

const ExtractionPage = () => {
  const [result, setResult] = useState<ExtractionResult | null>(null);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Name Extraction</h1>
        <p className="text-muted-foreground">
          AI-powered extraction of person and company names from documents
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <ExtractionForm onExtract={setResult} />
        </div>
        <div>
          <ExtractionResults result={result} />
        </div>
      </div>
    </div>
  );
};

export default ExtractionPage;
