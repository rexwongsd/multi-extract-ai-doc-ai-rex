export interface ExtractedPerson {
  name: string;
  confidence: 'high' | 'medium' | 'low';
  type: 'chinese' | 'malay' | 'indian' | 'western' | 'other';
}

export interface ExtractedCompany {
  name: string;
  confidence: 'high' | 'medium' | 'low';
}

export interface ExtractionResult {
  persons: ExtractedPerson[];
  companies: ExtractedCompany[];
  rawResponse?: string;
}

export interface ExtractionResponse {
  success: boolean;
  data?: ExtractionResult;
  error?: string;
}
