
import jsPDF from 'jspdf';
import 'jspdf-autotable';

declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

export const exportToCSV = (data: any[], tableName: string) => {
  if (!data || data.length === 0) {
    throw new Error('No data to export');
  }

  // Get headers from the first object
  const headers = Object.keys(data[0]);
  
  // Create CSV content
  const csvContent = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => {
        const value = row[header];
        // Handle null/undefined values and escape quotes
        if (value === null || value === undefined) return '';
        const stringValue = String(value);
        // Escape quotes and wrap in quotes if contains comma, quote, or newline
        if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
          return `"${stringValue.replace(/"/g, '""')}"`;
        }
        return stringValue;
      }).join(',')
    )
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const downloadUrl = URL.createObjectURL(blob);
  const fileName = `${tableName}_${new Date().toISOString().split('T')[0]}.csv`;

  return { fileName, downloadUrl };
};

export const exportToJSON = (data: any[], tableName: string) => {
  if (!data || data.length === 0) {
    throw new Error('No data to export');
  }

  const jsonContent = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
  const downloadUrl = URL.createObjectURL(blob);
  const fileName = `${tableName}_${new Date().toISOString().split('T')[0]}.json`;

  return { fileName, downloadUrl };
};

export const exportToPDF = (data: any[], tableName: string) => {
  if (!data || data.length === 0) {
    throw new Error('No data to export');
  }

  const doc = new jsPDF();
  
  // Add title
  doc.setFontSize(18);
  doc.text(`${tableName.toUpperCase()} Export`, 14, 22);
  
  // Add export date
  doc.setFontSize(10);
  doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 32);
  
  // Get headers and prepare table data
  const headers = Object.keys(data[0]);
  const tableData = data.map(row => 
    headers.map(header => {
      const value = row[header];
      if (value === null || value === undefined) return '';
      return String(value);
    })
  );

  // Add table
  doc.autoTable({
    head: [headers],
    body: tableData,
    startY: 40,
    styles: {
      fontSize: 8,
      cellPadding: 2,
    },
    headStyles: {
      fillColor: [66, 139, 202],
      textColor: 255,
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245],
    },
  });

  const pdfBlob = doc.output('blob');
  const downloadUrl = URL.createObjectURL(pdfBlob);
  const fileName = `${tableName}_${new Date().toISOString().split('T')[0]}.pdf`;

  return { fileName, downloadUrl };
};
