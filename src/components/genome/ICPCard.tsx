import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { ICPPersona } from "@/lib/demo-data";

interface ICPCardProps {
  persona: ICPPersona;
  index: number;
}

const ICPCard = ({ persona, index }: ICPCardProps) => {
  return (
    <Card className="border-border bg-card">
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-6 h-6 rounded-full bg-primary/15 text-primary text-xs flex items-center justify-center font-medium">
                {index + 1}
              </span>
              <h4 className="text-base font-semibold text-foreground">{persona.name}</h4>
            </div>
            <p className="text-sm text-muted-foreground">{persona.role}</p>
          </div>
          <div className="flex items-center gap-1.5">
            <Badge
              variant="outline"
              className={
                persona.priority === "primary"
                  ? "bg-primary/15 text-primary border-primary/30 text-[10px]"
                  : "text-[10px]"
              }
            >
              {persona.priority}
            </Badge>
            <Badge variant="outline" className="text-[10px]">
              {persona.size}
            </Badge>
          </div>
        </div>

        <p className="text-xs text-muted-foreground mb-4">{persona.demographics}</p>

        <div className="space-y-4">
          <div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-2">Pain Points</p>
            <ul className="space-y-1.5">
              {persona.painPoints.map((point, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground leading-relaxed">
                  <span className="w-1.5 h-1.5 rounded-full bg-destructive shrink-0 mt-2" />
                  {point}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-2">Goals</p>
            <ul className="space-y-1.5">
              {persona.goals.map((goal, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground leading-relaxed">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0 mt-2" />
                  {goal}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ICPCard;
