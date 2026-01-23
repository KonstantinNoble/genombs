import { useState } from 'react';
import { pdf } from '@react-pdf/renderer';
import { Button } from '@/components/ui/button';
import { Download, Lock, Loader2 } from 'lucide-react';
import { ValidationReportPDF } from './ValidationReportPDF';
import type { ValidationResult } from '@/hooks/useMultiAIValidation';
import { toast } from '@/hooks/use-toast';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useNavigate } from 'react-router-dom';

interface PDFExportButtonProps {
  result: ValidationResult;
  prompt: string;
  isPremium: boolean;
}

export function PDFExportButton({ result, prompt, isPremium }: PDFExportButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const navigate = useNavigate();

  const handleExport = async () => {
    if (!isPremium) {
      toast({
        title: "Premium Feature",
        description: "PDF export is available for Premium users. Upgrade to access this feature.",
        variant: "default",
      });
      navigate('/pricing');
      return;
    }

    setIsGenerating(true);

    try {
      // Generate PDF blob
      const blob = await pdf(
        <ValidationReportPDF result={result} prompt={prompt} />
      ).toBlob();

      // Create download URL
      const url = URL.createObjectURL(blob);
      
      // Create temporary link for download (mobile-compatible approach)
      const link = document.createElement('a');
      link.href = url;
      link.download = `synoptas-analysis-${Date.now()}.pdf`;
      
      // Append to DOM (required for iOS Safari)
      document.body.appendChild(link);
      
      // Trigger download
      link.click();
      
      // Clean up
      document.body.removeChild(link);
      
      // Revoke URL after delay to allow download to start
      setTimeout(() => {
        URL.revokeObjectURL(url);
      }, 5000);

      toast({
        title: "PDF Generated",
        description: "Your analysis report has been downloaded.",
      });
    } catch (error) {
      console.error('PDF generation error:', error);
      toast({
        title: "Export Failed",
        description: "Could not generate PDF. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  if (!isPremium) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="gap-2 opacity-70"
              onClick={handleExport}
            >
              <Lock className="h-4 w-4" />
              <span className="hidden sm:inline">Export PDF</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>PDF Export is a Premium feature</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <Button
      variant="outline"
      size="sm"
      className="gap-2 bg-gradient-to-r from-amber-500/10 to-yellow-500/10 border-amber-500/30 hover:border-amber-500/50 hover:bg-amber-500/20"
      onClick={handleExport}
      disabled={isGenerating}
    >
      {isGenerating ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="hidden sm:inline">Generating...</span>
        </>
      ) : (
        <>
          <Download className="h-4 w-4" />
          <span className="hidden sm:inline">Export PDF</span>
        </>
      )}
    </Button>
  );
}
