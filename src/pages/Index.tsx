import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LanguageSwitcher, type Language } from "@/components/LanguageSwitcher";
import { FileUpload } from "@/components/FileUpload";
import { ProcessingForm } from "@/components/ProcessingForm";
import { ResultsTable } from "@/components/ResultsTable";
import { Brain, FileText, Zap, Globe, Shield, Download, Moon, Sun } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { processFiles, type ExtractedData, type ProcessingProgress } from "@/utils/fileProcessor";
import heroImage from "@/assets/hero-bg.jpg";
const translations = {
  en: {
    title: "AI Document Intelligence",
    subtitle: "Extract & Process Documents with Multilingual AI",
    description: "Upload Excel and text files to automatically extract names and Malaysian phone numbers with AI-powered classification",
    features: {
      ai: "AI-Powered Extraction",
      multilingual: "Multilingual Support",
      processing: "Smart Processing",
      export: "Easy Export",
      security: "Secure & Private",
      format: "Format Validation"
    },
    getStarted: "Get Started",
    uploadFiles: "Upload Files",
    noFiles: "No files uploaded yet"
  },
  zh: {
    title: "AI文档智能处理",
    subtitle: "使用多语言AI提取和处理文档",
    description: "上传Excel和文本文件，使用AI驱动的分类自动提取姓名和马来西亚电话号码",
    features: {
      ai: "AI驱动提取",
      multilingual: "多语言支持",
      processing: "智能处理",
      export: "轻松导出",
      security: "安全私密",
      format: "格式验证"
    },
    getStarted: "开始使用",
    uploadFiles: "上传文件",
    noFiles: "尚未上传文件"
  },
  ms: {
    title: "Kecerdasan Dokumen AI",
    subtitle: "Ekstrak & Proses Dokumen dengan AI Multibahasa",
    description: "Muat naik fail Excel dan teks untuk mengekstrak nama dan nombor telefon Malaysia secara automatik dengan klasifikasi berkuasa AI",
    features: {
      ai: "Ekstraksi Berkuasa AI",
      multilingual: "Sokongan Multibahasa",
      processing: "Pemprosesan Pintar",
      export: "Eksport Mudah",
      security: "Selamat & Peribadi",
      format: "Pengesahan Format"
    },
    getStarted: "Mula",
    uploadFiles: "Muat Naik Fail",
    noFiles: "Belum ada fail dimuat naik"
  }
};
const Index = () => {
  const [language, setLanguage] = useState<Language>('en');
  const [files, setFiles] = useState<File[]>([]);
  const [extractedData, setExtractedData] = useState<ExtractedData[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState<'upload' | 'process' | 'results'>('upload');
  const [processingProgress, setProcessingProgress] = useState<ProcessingProgress | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    // Check for saved theme preference or default to light mode
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const shouldUseDark = savedTheme === 'dark' || (!savedTheme && prefersDark);
    
    setIsDarkMode(shouldUseDark);
    document.documentElement.classList.toggle('dark', shouldUseDark);
  }, []);

  const toggleTheme = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    document.documentElement.classList.toggle('dark', newTheme);
    localStorage.setItem('theme', newTheme ? 'dark' : 'light');
  };
  const {
    toast
  } = useToast();
  const t = translations[language];
  const handleFilesUpload = (uploadedFiles: File[]) => {
    setFiles(uploadedFiles);
    if (uploadedFiles.length > 0) {
      setCurrentStep('process');
    } else {
      setCurrentStep('upload');
    }
  };
  const handleProcess = async (prompt: string) => {
    setIsProcessing(true);
    setProcessingProgress(null);
    try {
      const results = await processFiles(files, progress => {
        setProcessingProgress(progress);
      });
      setExtractedData(results);
      setCurrentStep('results');
      const validPhoneNumbers = results.filter(d => d.phoneNumber && d.phoneNumber.length > 0).length;
      toast({
        title: "Processing Complete",
        description: `Extracted ${results.length} records with ${validPhoneNumbers} valid phone numbers`
      });
    } catch (error) {
      console.error('Processing error:', error);
      toast({
        title: "Processing Failed",
        description: error instanceof Error ? error.message : "An error occurred during document processing",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
      setProcessingProgress(null);
    }
  };
  const features = [{
    icon: Brain,
    title: t.features.ai,
    description: "Advanced AI algorithms extract and classify data automatically"
  }, {
    icon: Globe,
    title: t.features.multilingual,
    description: "Support for English, Chinese, and Bahasa Malaysia"
  }, {
    icon: Zap,
    title: t.features.processing,
    description: "Fast and accurate document processing with real-time results"
  }, {
    icon: Download,
    title: t.features.export,
    description: "Export processed data in CSV format with proper formatting"
  }, {
    icon: Shield,
    title: t.features.security,
    description: "Secure processing with data privacy protection"
  }, {
    icon: FileText,
    title: t.features.format,
    description: "Automatic validation and formatting of Malaysian phone numbers"
  }];
  return <div className="min-h-screen bg-gradient-secondary">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-gradient-primary rounded-lg">
              <Brain className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              DocAI Pro
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="h-9 w-9"
            >
              {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            <LanguageSwitcher currentLanguage={language} onLanguageChange={setLanguage} />
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden" style={{
      backgroundImage: `linear-gradient(rgba(240, 245, 255, 0.9), rgba(240, 245, 255, 0.9)), url(${heroImage})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center'
    }}>
        <div className="container mx-auto px-4 text-center">
          <Badge variant="outline" className="mb-6 bg-primary/10 text-primary border-primary/20">
            <Zap className="h-3 w-3 mr-1" />
            AI-Powered Document Processing
          </Badge>
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-hero bg-clip-text text-transparent">
            {t.title}
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            {t.subtitle}
          </p>
          <p className="text-lg mb-12 max-w-3xl mx-auto">
            {t.description}
          </p>
          <Button size="lg" className="bg-gradient-primary hover:shadow-glow hover:scale-105 transform transition-all duration-300" onClick={() => document.getElementById('upload-section')?.scrollIntoView({
          behavior: 'smooth'
        })}>
            <FileText className="h-5 w-5 mr-2" />
            {t.getStarted}
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-background/50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => <Card key={index} className="group hover:shadow-card transition-all duration-300 border-0 bg-card/80 backdrop-blur-sm">
                <CardContent className="p-6 text-center">
                  <div className="p-3 bg-gradient-primary rounded-full inline-block mb-4 group-hover:scale-110 transition-transform duration-300">
                    <feature.icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm">{feature.description}</p>
                </CardContent>
              </Card>)}
          </div>
        </div>
      </section>

      {/* Main Processing Section */}
      <section id="upload-section" className="py-16">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Step 1: File Upload */}
            <div className={`${currentStep === 'upload' ? 'lg:col-span-2' : ''}`}>
              <FileUpload language={language} onFilesUpload={handleFilesUpload} />
            </div>

            {/* Step 2: Processing Configuration */}
            {files.length > 0 && <div className={`${currentStep === 'process' ? 'lg:col-span-2' : ''}`}>
                <ProcessingForm language={language} files={files} onProcess={handleProcess} isProcessing={isProcessing} processingProgress={processingProgress} />
              </div>}

            {/* Progress Indicator */}
            <div className="lg:col-span-1">
              <Card className="shadow-card bg-gradient-secondary">
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-4">Processing Steps</h3>
                  <div className="space-y-4">
                    <div className={`flex items-center gap-3 ${currentStep === 'upload' ? 'text-primary' : files.length > 0 ? 'text-success' : 'text-muted-foreground'}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${files.length > 0 ? 'bg-success text-white' : currentStep === 'upload' ? 'bg-primary text-white' : 'bg-muted'}`}>
                        1
                      </div>
                      <span>{t.uploadFiles}</span>
                    </div>
                    <div className={`flex items-center gap-3 ${currentStep === 'process' ? 'text-primary' : extractedData.length > 0 ? 'text-success' : 'text-muted-foreground'}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${extractedData.length > 0 ? 'bg-success text-white' : currentStep === 'process' ? 'bg-primary text-white' : 'bg-muted'}`}>
                        2
                      </div>
                      <span>Configure AI</span>
                    </div>
                    <div className={`flex items-center gap-3 ${currentStep === 'results' ? 'text-primary' : 'text-muted-foreground'}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${currentStep === 'results' ? 'bg-primary text-white' : 'bg-muted'}`}>
                        3
                      </div>
                      <span>View Results</span>
                    </div>
                  </div>
                  
                  {files.length === 0 && <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                      <p className="text-sm text-muted-foreground">{t.noFiles}</p>
                    </div>}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Results Section */}
          {extractedData.length > 0 && <div className="mt-8">
              <ResultsTable language={language} data={extractedData} isLoading={isProcessing} />
            </div>}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-muted-foreground">© 2025 DocAI Pro - AI-Powered By Rex Wong Document Intelligence Platform</p>
        </div>
      </footer>
    </div>;
};
export default Index;