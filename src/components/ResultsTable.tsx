import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Download, Search, Filter, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Language } from "./LanguageSwitcher";
import * as XLSX from 'xlsx';

interface ExtractedData {
  id: string;
  name: string;
  phoneNumber: string;
  nameType: 'Chinese' | 'Malay' | 'Indian' | 'Other';
  source: string;
}

interface ResultsTableProps {
  language: Language;
  data: ExtractedData[];
  isLoading: boolean;
}

const translations = {
  en: {
    title: "Extraction Results",
    description: "Processed data with normalized Malaysian phone numbers",
    search: "Search names...",
    filter: "Filter by type",
    export: "Export Results",
    name: "Name/Company",
    phone: "Phone Number",
    type: "Name Type",
    source: "Source File",
    noResults: "No results found",
    totalRecords: "Total Records",
    validNumbers: "Valid Phone Numbers",
    exportSuccess: "Results exported successfully"
  },
  zh: {
    title: "提取结果",
    description: "已处理的数据，标准化马来西亚电话号码",
    search: "搜索姓名...",
    filter: "按类型筛选",
    export: "导出结果",
    name: "姓名/公司",
    phone: "电话号码",
    type: "姓名类型",
    source: "源文件",
    noResults: "未找到结果",
    totalRecords: "总记录数",
    validNumbers: "有效电话号码",
    exportSuccess: "结果导出成功"
  },
  ms: {
    title: "Hasil Ekstraksi",
    description: "Data yang diproses dengan nombor telefon Malaysia yang dinormalisasi",
    search: "Cari nama...",
    filter: "Tapis mengikut jenis",
    export: "Eksport Hasil",
    name: "Nama/Syarikat",
    phone: "Nombor Telefon",
    type: "Jenis Nama",
    source: "Fail Sumber",
    noResults: "Tiada hasil ditemui",
    totalRecords: "Jumlah Rekod",
    validNumbers: "Nombor Telefon Sah",
    exportSuccess: "Hasil berjaya dieksport"
  }
};

const nameTypes = {
  Chinese: { label: 'Chinese', color: 'bg-red-100 text-red-800' },
  Malay: { label: 'Malay', color: 'bg-green-100 text-green-800' },
  Indian: { label: 'Indian', color: 'bg-blue-100 text-blue-800' },
  Other: { label: 'Other', color: 'bg-gray-100 text-gray-800' }
};

export const ResultsTable = ({ language, data, isLoading }: ResultsTableProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const { toast } = useToast();
  const t = translations[language];

  const filteredData = data.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === "all" || item.nameType === filterType;
    return matchesSearch && matchesFilter;
  });

  const exportToExcel = () => {
    if (filteredData.length === 0) return;

    // Filter data to only include entries with valid phone numbers (excluding numbers starting with 03)
    const validData = filteredData.filter(item => item.phoneNumber && !item.phoneNumber.startsWith('03'));

    // Sort data by name type in the specified order: Chinese, Malay, Indian, Other
    const nameTypeOrder = ['Chinese', 'Malay', 'Indian', 'Other'];
    const sortedData = validData.sort((a, b) => {
      const aIndex = nameTypeOrder.indexOf(a.nameType);
      const bIndex = nameTypeOrder.indexOf(b.nameType);
      return aIndex - bIndex;
    });

    // Format data for 2-column Excel export
    const excelData = sortedData.map(row => ({
      'Name/Company': `${row.name} (${row.nameType})`,
      'Phone Number': row.phoneNumber
    }));

    // Create worksheet
    const worksheet = XLSX.utils.json_to_sheet(excelData);
    
    // Create workbook
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Extracted Data');

    // Download Excel file
    const fileName = `extracted_data_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(workbook, fileName);

    toast({
      title: t.exportSuccess,
      description: `${sortedData.length} records exported to Excel`,
    });
  };

  if (isLoading) {
    return (
      <Card className="shadow-card">
        <CardContent className="p-8">
          <div className="flex items-center justify-center space-x-2">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="text-lg">Processing documents...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              {t.title}
            </CardTitle>
            <CardDescription>{t.description}</CardDescription>
          </div>
          <div className="flex gap-2">
            <Badge variant="outline" className="bg-primary/10">
              {t.totalRecords}: {data.length}
            </Badge>
            <Badge variant="outline" className="bg-success/10 text-success">
              {t.validNumbers}: {data.filter(item => item.phoneNumber).length}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t.search}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 border border-border rounded-md bg-background"
          >
            <option value="all">{t.filter}</option>
            {Object.keys(nameTypes).map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
          <Button onClick={exportToExcel} disabled={filteredData.length === 0} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            {t.export}
          </Button>
        </div>

        {filteredData.length > 0 ? (
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t.name}</TableHead>
                  <TableHead>{t.phone}</TableHead>
                  <TableHead>{t.type}</TableHead>
                  <TableHead>{t.source}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell className="font-mono">
                      {item.phoneNumber ? (
                        <span className="bg-muted px-2 py-1 rounded text-sm">
                          {item.phoneNumber}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={nameTypes[item.nameType].color}
                      >
                        {nameTypes[item.nameType].label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {item.source}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>{t.noResults}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};