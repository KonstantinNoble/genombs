import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import PremiumLock from "@/components/genome/PremiumLock";
import type { ICPPersona } from "@/lib/demo-data";

interface ICPCardProps {
  persona: ICPPersona;
  index: number;
  isPremium?: boolean;
}

const ICPCard = ({ persona, index, isPremium = false }: ICPCardProps) => {
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
            <p className="text-base text-foreground/70">{persona.role}</p>
          </div>
          <div className="flex items-center gap-1.5">
            <Badge
              variant="outline"
              className={
                persona.priority === "primary"
                  ? "bg-primary/15 text-primary border-primary/30 text-xs"
                  : "text-xs"
              }
            >
              {persona.priority}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {persona.size}
            </Badge>
          </div>
        </div>

        <p className="text-sm text-foreground/70 mb-4">{persona.demographics}</p>

        <div className="space-y-4">
          {/* Free: Pain Points + Goals */}
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Pain Points</p>
            <ul className="space-y-1.5">
              {persona.painPoints.map((point, i) => (
                <li key={i} className="flex items-start gap-2 text-base text-foreground/70 leading-relaxed">
                  <span className="w-1.5 h-1.5 rounded-full bg-destructive shrink-0 mt-2" />
                  {point}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Goals</p>
            <ul className="space-y-1.5">
              {persona.goals.map((goal, i) => (
                <li key={i} className="flex items-start gap-2 text-base text-foreground/70 leading-relaxed">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0 mt-2" />
                  {goal}
                </li>
              ))}
            </ul>
          </div>

          {/* Premium: Buying Triggers, Objections, Where to Find */}
          {isPremium ? (
            <>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Buying Triggers</p>
                <ul className="space-y-1.5">
                  {persona.buyingTriggers.map((trigger, i) => (
                    <li key={i} className="flex items-start gap-2 text-base text-foreground/70 leading-relaxed">
                      <span className="w-1.5 h-1.5 rounded-full bg-chart-4 shrink-0 mt-2" />
                      {trigger}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Common Objections</p>
                <ul className="space-y-1.5">
                  {persona.objections.map((objection, i) => (
                    <li key={i} className="flex items-start gap-2 text-base text-foreground/70 leading-relaxed">
                      <span className="w-1.5 h-1.5 rounded-full bg-destructive shrink-0 mt-2" />
                      {objection}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Where to Find Them</p>
                <div className="flex flex-wrap gap-1.5">
                  {persona.whereToFind.map((place, i) => (
                    <Badge key={i} variant="secondary" className="text-xs font-mono font-normal">
                      {place}
                    </Badge>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <PremiumLock title="Unlock Buying Triggers, Objections & Where to Find">
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Buying Triggers</p>
                  <ul className="space-y-1.5">
                    {persona.buyingTriggers.map((trigger, i) => (
                      <li key={i} className="flex items-start gap-2 text-base text-foreground/70 leading-relaxed">
                        <span className="w-1.5 h-1.5 rounded-full bg-chart-4 shrink-0 mt-2" />
                        {trigger}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Common Objections</p>
                  <ul className="space-y-1.5">
                    {persona.objections.map((objection, i) => (
                      <li key={i} className="flex items-start gap-2 text-base text-foreground/70 leading-relaxed">
                        <span className="w-1.5 h-1.5 rounded-full bg-destructive shrink-0 mt-2" />
                        {objection}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-2">Where to Find Them</p>
                  <div className="flex flex-wrap gap-1.5">
                    {persona.whereToFind.map((place, i) => (
                      <Badge key={i} variant="secondary" className="text-xs font-mono font-normal">
                        {place}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </PremiumLock>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ICPCard;
