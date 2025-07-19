
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ExportButton from '@/components/ExportButton';
import ExportResults from '@/components/ExportResults';
import { ExportResult } from '@/types/export';

const ExportPage = () => {
  const [exportResults, setExportResults] = useState<ExportResult[]>([]);

  const { data: dataCounts, isLoading } = useQuery({
    queryKey: ['export-data-counts'],
    queryFn: async () => {
      const [bookmarks, contacts, todos, profiles] = await Promise.all([
        supabase.from('bookmarks').select('id', { count: 'exact', head: true }),
        supabase.from('contacts').select('id', { count: 'exact', head: true }),
        supabase.from('todos').select('id', { count: 'exact', head: true }),
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
      ]);

      return {
        bookmarks: bookmarks.count || 0,
        contacts: contacts.count || 0,
        todos: todos.count || 0,
        profiles: profiles.count || 0,
      };
    },
  });

  const handleExportComplete = (result: ExportResult) => {
    setExportResults(prev => [result, ...prev.slice(0, 9)]); // Keep last 10 results
  };

  const exportOptions = [
    {
      title: 'Bookmarks',
      description: 'Export all your saved bookmarks',
      table: 'bookmarks',
      count: dataCounts?.bookmarks || 0,
    },
    {
      title: 'Contacts',
      description: 'Export your contact information',
      table: 'contacts',
      count: dataCounts?.contacts || 0,
    },
    {
      title: 'Todos',
      description: 'Export your todo items and tasks',
      table: 'todos',
      count: dataCounts?.todos || 0,
    },
    {
      title: 'Profiles',
      description: 'Export user profile data',
      table: 'profiles',
      count: dataCounts?.profiles || 0,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Export Data</h1>
        <p className="text-muted-foreground">Export your data in various formats</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {exportOptions.map((option) => (
          <Card key={option.table}>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                {option.title}
                <span className="text-sm font-normal text-muted-foreground">
                  {isLoading ? '...' : `${option.count} items`}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">{option.description}</p>
              <div className="flex flex-wrap gap-2">
                <ExportButton
                  table={option.table}
                  format="csv"
                  onExportComplete={handleExportComplete}
                  disabled={option.count === 0}
                />
                <ExportButton
                  table={option.table}
                  format="json"
                  onExportComplete={handleExportComplete}
                  disabled={option.count === 0}
                />
                <ExportButton
                  table={option.table}
                  format="pdf"
                  onExportComplete={handleExportComplete}
                  disabled={option.count === 0}
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <ExportResults results={exportResults} />
    </div>
  );
};

export default ExportPage;
