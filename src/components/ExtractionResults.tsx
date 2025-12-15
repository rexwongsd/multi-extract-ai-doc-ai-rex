import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ExtractionResult } from '@/types/extraction';
import { User, Building2, CheckCircle2, AlertCircle, HelpCircle } from 'lucide-react';

interface ExtractionResultsProps {
  result: ExtractionResult | null;
}

const getConfidenceIcon = (confidence: string) => {
  switch (confidence) {
    case 'high':
      return <CheckCircle2 className="h-4 w-4 text-green-500" />;
    case 'medium':
      return <AlertCircle className="h-4 w-4 text-yellow-500" />;
    case 'low':
      return <HelpCircle className="h-4 w-4 text-orange-500" />;
    default:
      return null;
  }
};

const getConfidenceBadgeVariant = (confidence: string) => {
  switch (confidence) {
    case 'high':
      return 'default';
    case 'medium':
      return 'secondary';
    case 'low':
      return 'outline';
    default:
      return 'outline';
  }
};

const getTypeBadge = (type: string) => {
  const colors: Record<string, string> = {
    chinese: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
    malay: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
    indian: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300',
    western: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
    other: 'bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300',
  };
  return colors[type] || colors.other;
};

const ExtractionResults = ({ result }: ExtractionResultsProps) => {
  if (!result) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-muted-foreground">Extraction Results</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            No extraction results yet. Upload a file or paste text to extract names.
          </p>
        </CardContent>
      </Card>
    );
  }

  const totalPersons = result.persons?.length || 0;
  const totalCompanies = result.companies?.length || 0;

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <User className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalPersons}</p>
                <p className="text-sm text-muted-foreground">Person Names</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Building2 className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalCompanies}</p>
                <p className="text-sm text-muted-foreground">Company Names</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Person Names */}
      {totalPersons > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Extracted Person Names
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-3 font-medium">#</th>
                    <th className="text-left py-2 px-3 font-medium">Name</th>
                    <th className="text-left py-2 px-3 font-medium">Type</th>
                    <th className="text-left py-2 px-3 font-medium">Confidence</th>
                  </tr>
                </thead>
                <tbody>
                  {result.persons.map((person, index) => (
                    <tr key={index} className="border-b last:border-b-0 hover:bg-muted/50">
                      <td className="py-2 px-3 text-muted-foreground">{index + 1}</td>
                      <td className="py-2 px-3 font-medium">{person.name}</td>
                      <td className="py-2 px-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeBadge(person.type)}`}>
                          {person.type}
                        </span>
                      </td>
                      <td className="py-2 px-3">
                        <div className="flex items-center gap-2">
                          {getConfidenceIcon(person.confidence)}
                          <Badge variant={getConfidenceBadgeVariant(person.confidence) as any}>
                            {person.confidence}
                          </Badge>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Company Names */}
      {totalCompanies > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Extracted Company Names
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-3 font-medium">#</th>
                    <th className="text-left py-2 px-3 font-medium">Company Name</th>
                    <th className="text-left py-2 px-3 font-medium">Confidence</th>
                  </tr>
                </thead>
                <tbody>
                  {result.companies.map((company, index) => (
                    <tr key={index} className="border-b last:border-b-0 hover:bg-muted/50">
                      <td className="py-2 px-3 text-muted-foreground">{index + 1}</td>
                      <td className="py-2 px-3 font-medium">{company.name}</td>
                      <td className="py-2 px-3">
                        <div className="flex items-center gap-2">
                          {getConfidenceIcon(company.confidence)}
                          <Badge variant={getConfidenceBadgeVariant(company.confidence) as any}>
                            {company.confidence}
                          </Badge>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* No results message */}
      {totalPersons === 0 && totalCompanies === 0 && (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground py-4">
              No names or companies were found in the provided text.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ExtractionResults;
