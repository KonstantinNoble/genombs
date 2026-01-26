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
import { useIsMobile } from '@/hooks/use-mobile';
interface PDFExportButtonProps {
  result: ValidationResult;
  prompt: string;
  isPremium: boolean;
  isConfirmed?: boolean;
  confirmedAt?: string;
  onRequireConfirmation?: () => void;
  viewerIsPremium?: boolean;
  isTeamAnalysis?: boolean;
}

export function PDFExportButton({ result, prompt, isPremium, isConfirmed = false, confirmedAt, onRequireConfirmation, viewerIsPremium = false, isTeamAnalysis = false }: PDFExportButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  // Check if this is a premium viewer looking at a free user's team analysis
  const isTeammateFreemiumAnalysis = viewerIsPremium && !isPremium && isTeamAnalysis;

  // Hide PDF export on mobile devices
  if (isMobile) {
    return null;
  }

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

    // Check for confirmation before allowing export
    if (!isConfirmed) {
      toast({
        title: "Confirmation Required",
        description: "Please confirm decision ownership before exporting the audit report.",
        variant: "default",
      });
      onRequireConfirmation?.();
      return;
    }

    setIsGenerating(true);

    try {
      // Generate PDF blob with confirmation timestamp
      const blob = await pdf(
        <ValidationReportPDF 
          result={result} 
          prompt={prompt}
          confirmedAt={confirmedAt || new Date().toISOString()}
        />
      ).toBlob();

      // Create download URL
      const url = URL.createObjectURL(blob);
      
      // Create temporary link for download (mobile-compatible approach)
      const link = document.createElement('a');
      link.href = url;
      link.download = `decision-audit-report-${Date.now()}.pdf`;
      
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
        title: "Decision Audit Report Generated",
        description: "Your audit report has been downloaded.",
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

  // Premium viewer looking at free teammate's analysis - show info tooltip, no upgrade link
  if (isTeammateFreemiumAnalysis) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="gap-2 opacity-50 cursor-not-allowed"
              disabled
            >
              <Lock className="h-4 w-4" />
              <span className="hidden sm:inline">Export PDF</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>PDF not available – created by Free user</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

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
          <span className="hidden sm:inline">Export Audit Report</span>
        </>
      )}
    </Button>
  );
}
