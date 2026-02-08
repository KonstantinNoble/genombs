import { Card, CardContent } from "@/components/ui/card";
import { Lightbulb } from "lucide-react";

interface KeyTakeawaysProps {
  takeaways: string[];
}

const KeyTakeaways = ({ takeaways }: KeyTakeawaysProps) => {
  if (!takeaways || takeaways.length === 0) return null;

  return (
    <Card className="border-border bg-card">
      <CardContent className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Lightbulb className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold text-foreground">Key Takeaways</h2>
        </div>
        <p className="text-xs text-muted-foreground mb-4 uppercase tracking-wide">
          Summary of the most important market observations
        </p>
        <ul className="space-y-3">
          {takeaways.map((takeaway, i) => (
            <li key={i} className="flex items-start gap-3 text-sm text-muted-foreground leading-relaxed">
              <span className="w-6 h-6 rounded-full bg-primary/15 text-primary text-xs flex items-center justify-center shrink-0 mt-0.5 font-medium">
                {i + 1}
              </span>
              {takeaway}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
};

export default KeyTakeaways;
