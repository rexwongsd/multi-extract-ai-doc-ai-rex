import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Play, Settings } from "lucide-react";
import type { Language } from "./LanguageSwitcher";

interface ProcessingFormProps {
  language: Language;
  files: File[];
  onProcess: (prompt: string) => void;
  isProcessing: boolean;
}

const translations = {
  en: {
    title: "AI Processing Configuration",
    description: "Configure how the AI should extract and process your documents",
    prompt: "Processing Instructions",
    promptPlaceholder: "Enter specific instructions for data extraction (e.g., 'Extract names and phone numbers from customer lists')",
    examples: "Example prompts:",
    example1: "Extract customer names and Malaysian phone numbers",
    example2: "Find company names and contact information",
    example3: "Get all personal details including names and phone numbers",
    process: "Start Processing",
    processing: "Processing...",
    filesSelected: "files selected",
    ready: "Ready to process"
  },
  zh: {
    title: "AI处理配置",
    description: "配置AI如何提取和处理您的文档",
    prompt: "处理指令",
    promptPlaceholder: "输入数据提取的具体指令（例如：'从客户列表中提取姓名和电话号码'）",
    examples: "示例提示：",
    example1: "提取客户姓名和马来西亚电话号码",
    example2: "查找公司名称和联系信息",
    example3: "获取所有个人详细信息，包括姓名和电话号码",
    process: "开始处理",
    processing: "处理中...",
    filesSelected: "个文件已选择",
    ready: "准备处理"
  },
  ms: {
    title: "Konfigurasi Pemprosesan AI",
    description: "Konfigurasikan bagaimana AI harus mengekstrak dan memproses dokumen anda",
    prompt: "Arahan Pemprosesan",
    promptPlaceholder: "Masukkan arahan khusus untuk ekstraksi data (cth: 'Ekstrak nama dan nombor telefon dari senarai pelanggan')",
    examples: "Contoh arahan:",
    example1: "Ekstrak nama pelanggan dan nombor telefon Malaysia",
    example2: "Cari nama syarikat dan maklumat hubungan",
    example3: "Dapatkan semua butiran peribadi termasuk nama dan nombor telefon",
    process: "Mula Pemprosesan",
    processing: "Memproses...",
    filesSelected: "fail dipilih",
    ready: "Sedia untuk diproses"
  }
};

export const ProcessingForm = ({ language, files, onProcess, isProcessing }: ProcessingFormProps) => {
  const [prompt, setPrompt] = useState("");
  const t = translations[language];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim() && files.length > 0) {
      onProcess(prompt);
    }
  };

  const examplePrompts = [t.example1, t.example2, t.example3];

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          {t.title}
        </CardTitle>
        <CardDescription>{t.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="prompt">{t.prompt}</Label>
            <Textarea
              id="prompt"
              placeholder={t.promptPlaceholder}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={4}
              className="resize-none"
            />
          </div>

          <div className="space-y-3">
            <p className="text-sm font-medium text-muted-foreground">{t.examples}</p>
            <div className="flex flex-wrap gap-2">
              {examplePrompts.map((example, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                  onClick={() => setPrompt(example)}
                >
                  {example}
                </Badge>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-primary/10">
                {files.length} {t.filesSelected}
              </Badge>
              {files.length > 0 && prompt.trim() && (
                <Badge variant="outline" className="bg-success/10 text-success">
                  {t.ready}
                </Badge>
              )}
            </div>
            
            <Button
              type="submit"
              disabled={!prompt.trim() || files.length === 0 || isProcessing}
              className="bg-gradient-primary hover:shadow-glow transition-all duration-300"
            >
              <Play className="h-4 w-4 mr-2" />
              {isProcessing ? t.processing : t.process}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};