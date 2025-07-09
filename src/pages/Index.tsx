import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LanguageSwitcher, type Language } from "@/components/LanguageSwitcher";
import { FileUpload } from "@/components/FileUpload";
import { ProcessingForm } from "@/components/ProcessingForm";
import { ResultsTable } from "@/components/ResultsTable";
import { Brain, FileText, Zap, Globe, Shield, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import heroImage from "@/assets/hero-bg.jpg";

interface ExtractedData {
  id: string;
  name: string;
  phoneNumber: string;
  nameType: 'Chinese' | 'Malay' | 'Indian' | 'Other';
  source: string;
}

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
  const { toast } = useToast();
  const t = translations[language];

  const handleFilesUpload = (uploadedFiles: File[]) => {
    setFiles(uploadedFiles);
    if (uploadedFiles.length > 0) {
      setCurrentStep('process');
    } else {
      setCurrentStep('upload');
    }
  };

  // Mock phone number normalization function
  const normalizePhoneNumber = (phone: string): string => {
    // Remove all non-digit characters
    const digits = phone.replace(/\D/g, '');
    
    // Malaysian phone number patterns
    if (digits.startsWith('60')) {
      // Remove country code and format
      const number = digits.substring(2);
      if (number.length >= 9) {
        return `0${number.substring(0, number.length)}`;
      }
    } else if (digits.startsWith('0')) {
      // Already starts with 0
      return digits.substring(0, 10);
    } else if (digits.length >= 8) {
      // Add leading 0
      return `0${digits.substring(0, 9)}`;
    }
    
    return '';
  };

  // Mock name classification function
  const classifyName = (name: string): 'Chinese' | 'Malay' | 'Indian' | 'Other' => {
    const lowerName = name.toLowerCase();
    
    // Simple classification based on common patterns
    if (/[李王张刘陈杨黄吴赵周]/.test(name) || 
        /\b(lim|tan|lee|wong|ng|ong|teo|goh|koh)\b/i.test(lowerName)) {
      return 'Chinese';
    } else if (/\b(ahmad|ali|hassan|ibrahim|mohamed|abdullah|ismail|rahman)\b/i.test(lowerName) ||
               /\b(siti|nur|fatimah|noraini|rohani)\b/i.test(lowerName)) {
      return 'Malay';
    } else if (/\b(kumar|raj|devi|lakshmi|ravi|suresh|anand|prakash)\b/i.test(lowerName)) {
      return 'Indian';
    }
    
    return 'Other';
  };

  const handleProcess = async (prompt: string) => {
    setIsProcessing(true);
    
    try {
      // Simulate AI processing delay
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Mock extracted data - in real implementation, this would call your AI service
      const mockData: ExtractedData[] = [
        {
          id: '1',
          name: 'Ahmad Hassan',
          phoneNumber: normalizePhoneNumber('60123456789'),
          nameType: classifyName('Ahmad Hassan'),
          source: files[0]?.name || 'sample.xlsx'
        },
        {
          id: '2',
          name: 'Lim Wei Ming',
          phoneNumber: normalizePhoneNumber('012-345-6789'),
          nameType: classifyName('Lim Wei Ming'),
          source: files[0]?.name || 'sample.xlsx'
        },
        {
          id: '3',
          name: 'Rajesh Kumar',
          phoneNumber: normalizePhoneNumber('+60 123 456 789'),
          nameType: classifyName('Rajesh Kumar'),
          source: files[0]?.name || 'sample.xlsx'
        },
        {
          id: '4',
          name: 'Siti Noraini',
          phoneNumber: normalizePhoneNumber('123456789'),
          nameType: classifyName('Siti Noraini'),
          source: files[0]?.name || 'sample.xlsx'
        }
      ];
      
      setExtractedData(mockData);
      setCurrentStep('results');
      
      toast({
        title: "Processing Complete",
        description: `Extracted ${mockData.length} records with ${mockData.filter(d => d.phoneNumber).length} valid phone numbers`,
      });
    } catch (error) {
      toast({
        title: "Processing Failed",
        description: "An error occurred during document processing",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const features = [
    {
      icon: Brain,
      title: t.features.ai,
      description: "Advanced AI algorithms extract and classify data automatically"
    },
    {
      icon: Globe,
      title: t.features.multilingual,
      description: "Support for English, Chinese, and Bahasa Malaysia"
    },
    {
      icon: Zap,
      title: t.features.processing,
      description: "Fast and accurate document processing with real-time results"
    },
    {
      icon: Download,
      title: t.features.export,
      description: "Export processed data in CSV format with proper formatting"
    },
    {
      icon: Shield,
      title: t.features.security,
      description: "Secure processing with data privacy protection"
    },
    {
      icon: FileText,
      title: t.features.format,
      description: "Automatic validation and formatting of Malaysian phone numbers"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-secondary">
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
          <LanguageSwitcher currentLanguage={language} onLanguageChange={setLanguage} />
        </div>
      </header>

      {/* Hero Section */}
      <section 
        className="relative py-20 overflow-hidden"
        style={{
          backgroundImage: `linear-gradient(rgba(240, 245, 255, 0.9), rgba(240, 245, 255, 0.9)), url(${heroImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
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
          <Button 
            size="lg" 
            className="bg-gradient-primary hover:shadow-glow hover:scale-105 transform transition-all duration-300"
            onClick={() => document.getElementById('upload-section')?.scrollIntoView({ behavior: 'smooth' })}
          >
            <FileText className="h-5 w-5 mr-2" />
            {t.getStarted}
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-background/50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="group hover:shadow-card transition-all duration-300 border-0 bg-card/80 backdrop-blur-sm">
                <CardContent className="p-6 text-center">
                  <div className="p-3 bg-gradient-primary rounded-full inline-block mb-4 group-hover:scale-110 transition-transform duration-300">
                    <feature.icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
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
            {files.length > 0 && (
              <div className={`${currentStep === 'process' ? 'lg:col-span-2' : ''}`}>
                <ProcessingForm 
                  language={language} 
                  files={files} 
                  onProcess={handleProcess}
                  isProcessing={isProcessing}
                />
              </div>
            )}

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
                  
                  {files.length === 0 && (
                    <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                      <p className="text-sm text-muted-foreground">{t.noFiles}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Results Section */}
          {extractedData.length > 0 && (
            <div className="mt-8">
              <ResultsTable 
                language={language} 
                data={extractedData} 
                isLoading={isProcessing}
              />
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-muted-foreground">
            © 2024 DocAI Pro - AI-Powered Document Intelligence Platform
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;