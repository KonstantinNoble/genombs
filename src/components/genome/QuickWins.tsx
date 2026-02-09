import { Card, CardContent } from "@/components/ui/card";

interface QuickWinsProps {
  wins: string[];
}

const QuickWins = ({ wins }: QuickWinsProps) => {
  if (!wins || wins.length === 0) return null;

  return (
    <Card className="border-border bg-card">
      <CardContent className="p-6">
        <h2 className="text-lg font-semibold text-foreground mb-1">Quick Wins</h2>
        <p className="text-xs text-muted-foreground mb-4 uppercase tracking-wide">
          Highest-impact actions to implement first
        </p>
        <ul className="space-y-3">
          {wins.map((win, i) => (
            <li key={i} className="flex items-start gap-3 text-sm text-muted-foreground leading-relaxed">
              <span className="w-6 h-6 rounded-full bg-primary/15 text-primary text-xs flex items-center justify-center shrink-0 mt-0.5 font-medium">
                {i + 1}
              </span>
              {win}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
};

export default QuickWins;
