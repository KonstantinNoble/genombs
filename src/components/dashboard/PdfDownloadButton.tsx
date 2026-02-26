import { useState } from "react";
import { pdf } from "@react-pdf/renderer";
import { Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import PdfReport from "./PdfReport";
import type { WebsiteProfile, ImprovementTask } from "@/types/chat";

interface PdfDownloadButtonProps {
  profiles: WebsiteProfile[];
  tasks: ImprovementTask[];
}

const PdfDownloadButton = ({ profiles, tasks }: PdfDownloadButtonProps) => {
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    setLoading(true);
    try {
      const blob = await pdf(<PdfReport profiles={profiles} tasks={tasks} />).toBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      const date = new Date().toISOString().slice(0, 10);
      const ownUrl = profiles.find((p) => p.is_own_website)?.url;
      const slug = ownUrl
        ? ownUrl.replace(/^https?:\/\/(www\.)?/, "").replace(/[^a-zA-Z0-9]/g, "-").replace(/-+/g, "-").substring(0, 30)
        : "analysis";
      a.href = url;
      a.download = `synvertas-${slug}-${date}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error("PDF generation failed:", e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      className="h-7 text-[10px] px-2 gap-1 text-muted-foreground hover:text-foreground"
      onClick={handleDownload}
      disabled={loading}
    >
      {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Download className="w-3 h-3" />}
      PDF
    </Button>
  );
};

export default PdfDownloadButton;
