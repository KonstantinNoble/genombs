import { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  showSteps?: boolean;
  onTryExample?: () => void;
}

const EmptyState = ({ icon: Icon, title, description, showSteps, onTryExample }: EmptyStateProps) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center border-2 border-dashed border-border rounded-xl">
      <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-sm mb-6">{description}</p>

      {showSteps && (
        <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 mb-6">
          {[
            { step: "1", text: "Enter URL" },
            { step: "2", text: "Click Analyze" },
            { step: "3", text: "View your Genome" },
          ].map((s, i) => (
            <div key={s.step} className="flex items-center gap-2">
              {i > 0 && <span className="hidden sm:inline text-muted-foreground/30">→</span>}
              <span className="w-6 h-6 rounded-full bg-primary/15 text-primary text-xs flex items-center justify-center font-medium">
                {s.step}
              </span>
              <span className="text-sm text-muted-foreground">{s.text}</span>
            </div>
          ))}
        </div>
      )}

      {onTryExample && (
        <button
          onClick={onTryExample}
          className="text-sm text-primary hover:underline font-medium"
        >
          Try: stripe.com
        </button>
      )}
    </div>
  );
};

export default EmptyState;
