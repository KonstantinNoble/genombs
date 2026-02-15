import { useIsMobile } from "@/hooks/use-mobile";
import { Monitor } from "lucide-react";
import synvertasLogo from "@/assets/synvertas-logo.png";

const MobileBlocker = () => {
  const isMobile = useIsMobile();

  if (!isMobile) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-background p-8">
      <div className="flex flex-col items-center gap-6 text-center max-w-sm">
        <img src={synvertasLogo} alt="Synvertas" className="h-8 object-contain" />
        <Monitor className="h-16 w-16 text-primary" />
        <h1 className="text-2xl font-bold text-foreground">Desktop Only</h1>
        <p className="text-muted-foreground text-base leading-relaxed">
          The analysis workspace is optimized for desktop use. Please open this page on a computer for the best experience.
        </p>
      </div>
    </div>
  );
};

export default MobileBlocker;
