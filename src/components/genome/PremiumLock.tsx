import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";

interface PremiumLockProps {
  children: React.ReactNode;
  title?: string;
}

const PremiumLock = ({ children, title = "Unlock with Premium" }: PremiumLockProps) => {
  const { isPremium } = useAuth();
  const navigate = useNavigate();

  if (isPremium) {
    return <>{children}</>;
  }

  return (
    <div className="relative">
      <div className="blur-sm opacity-60 pointer-events-none select-none">
        {children}
      </div>
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/70 rounded-lg">
        <p className="text-sm font-semibold text-foreground mb-3">{title}</p>
        <Button size="sm" onClick={() => navigate("/pricing")}>
          Upgrade to Premium
        </Button>
      </div>
    </div>
  );
};

export default PremiumLock;
