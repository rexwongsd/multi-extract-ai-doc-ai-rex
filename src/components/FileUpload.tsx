import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Upload, File, X, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Language } from "./LanguageSwitcher";

interface FileUploadProps {
  language: Language;
  onFilesUpload: (files: File[]) => void;
}

const translations = {
  en: {
    title: "Upload Documents",
    description: "Upload Excel or text files for AI processing",
    dropzone: "Drag & drop files here, or click to select",
    limits: "Maximum 8 files, 25MB each",
    uploaded: "Uploaded Files",
    remove: "Remove",
    invalidFile: "Invalid file type or size",
    maxFiles: "Maximum 8 files allowed",
    processing: "Processing files..."
  },
  zh: {
    title: "上传文档",
    description: "上传Excel或文本文件进行AI处理",
    dropzone: "拖拽文件到此处，或点击选择文件",
    limits: "最多8个文件，每个25MB",
    uploaded: "已上传文件",
    remove: "移除",
    invalidFile: "无效的文件类型或大小",
    maxFiles: "最多允许8个文件",
    processing: "处理文件中..."
  },
  ms: {
    title: "Muat Naik Dokumen",
    description: "Muat naik fail Excel atau teks untuk pemprosesan AI",
    dropzone: "Seret & lepas fail di sini, atau klik untuk memilih",
    limits: "Maksimum 8 fail, 25MB setiap satu",
    uploaded: "Fail Yang Dimuat Naik",
    remove: "Buang",
    invalidFile: "Jenis fail atau saiz tidak sah",
    maxFiles: "Maksimum 8 fail dibenarkan",
    processing: "Memproses fail..."
  }
};

export const FileUpload = ({ language, onFilesUpload }: FileUploadProps) => {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  const t = translations[language];

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const validFiles = acceptedFiles.filter(file => {
      const isValidType = file.type.includes('sheet') || 
                         file.type.includes('excel') || 
                         file.type === 'text/plain' ||
                         file.name.endsWith('.xlsx') ||
                         file.name.endsWith('.xls') ||
                         file.name.endsWith('.txt');
      const isValidSize = file.size <= 25 * 1024 * 1024; // 25MB
      return isValidType && isValidSize;
    });

    if (validFiles.length !== acceptedFiles.length) {
      toast({
        title: t.invalidFile,
        variant: "destructive"
      });
    }

    const newFiles = [...files, ...validFiles].slice(0, 8);
    
    if (newFiles.length > 8) {
      toast({
        title: t.maxFiles,
        variant: "destructive"
      });
      return;
    }

    setFiles(newFiles);
    onFilesUpload(newFiles);
  }, [files, onFilesUpload, toast, t]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
      'text/plain': ['.txt']
    },
    maxFiles: 8,
    maxSize: 25 * 1024 * 1024
  });

  const removeFile = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index);
    setFiles(newFiles);
    onFilesUpload(newFiles);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          {t.title}
        </CardTitle>
        <CardDescription>{t.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-300 ${
            isDragActive 
              ? 'border-primary bg-primary/5 shadow-glow' 
              : 'border-border hover:border-primary/50 hover:bg-muted/50'
          }`}
        >
          <input {...getInputProps()} />
          <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-lg font-medium mb-2">{t.dropzone}</p>
          <p className="text-sm text-muted-foreground">{t.limits}</p>
        </div>

        {files.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium flex items-center gap-2">
              <File className="h-4 w-4" />
              {t.uploaded} ({files.length}/8)
            </h4>
            {files.map((file, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-3">
                  <File className="h-4 w-4 text-primary" />
                  <div>
                    <p className="font-medium text-sm">{file.name}</p>
                    <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFile(index)}
                  className="text-destructive hover:text-destructive"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {isProcessing && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 animate-spin" />
              <span className="text-sm">{t.processing}</span>
            </div>
            <Progress value={65} className="w-full" />
          </div>
        )}
      </CardContent>
    </Card>
  );
};