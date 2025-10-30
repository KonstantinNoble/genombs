import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CombinedRecommendation } from "@/pages/NotionIdea";
import { Wrench, Lightbulb, Clock, DollarSign, Calendar, Building, Users, Wallet } from "lucide-react";
import { format } from "date-fns";

interface RecommendationCardProps {
  recommendation: CombinedRecommendation;
}

const getTimelineBadgeVariant = (timeline?: string): "default" | "secondary" | "outline" => {
  if (!timeline) return "outline";
  if (timeline.includes('quick')) return "default";
  if (timeline.includes('medium')) return "secondary";
  return "outline";
};

const getTimelineBadgeColor = (timeline?: string): string => {
  if (!timeline) return "";
  if (timeline.includes('quick')) return "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20";
  if (timeline.includes('medium')) return "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20";
  return "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20";
};

const RecommendationCard = ({ recommendation }: RecommendationCardProps) => {
  const {
    type,
    name,
    implementation,
    viability,
    estimatedCost,
    estimatedInvestment,
    rationale,
    sourceDate,
    sourceIndustry,
    sourceBudget,
    sourceTeamSize
  } = recommendation;

  const timeline = type === 'tool' ? implementation : viability;
  const cost = type === 'tool' ? estimatedCost : estimatedInvestment;

  return (
    <Card className="group hover:shadow-glow hover:-translate-y-1 transition-all duration-500 border-l-4 overflow-hidden relative bg-gradient-to-br from-card to-card/80" 
          style={{ borderLeftColor: type === 'tool' ? 'hsl(var(--primary))' : 'hsl(var(--secondary))' }}>
      {/* Gradient overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
      
      <CardContent className="p-7 relative">
        {/* Header */}
        <div className="flex items-start gap-4 mb-5">
          <div className={`p-3 rounded-xl shadow-sm group-hover:scale-110 transition-transform duration-300 ${type === 'tool' ? 'bg-gradient-to-br from-primary/20 to-primary/5' : 'bg-gradient-to-br from-secondary/20 to-secondary/5'}`}>
            {type === 'tool' ? (
              <Wrench className="h-6 w-6 text-primary" />
            ) : (
              <Lightbulb className="h-6 w-6 text-secondary" />
            )}
          </div>
          <div className="flex-1">
            <h4 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors">{name}</h4>
            <div className="flex flex-wrap gap-2">
              {timeline && (
                <Badge className={`${getTimelineBadgeColor(timeline)} px-3 py-1 font-semibold shadow-sm`}>
                  <Clock className="h-3 w-3 mr-1.5" />
                  {timeline.split('-').map(word => 
                    word.charAt(0).toUpperCase() + word.slice(1)
                  ).join(' ')}
                </Badge>
              )}
              {cost && (
                <Badge variant="outline" className="px-3 py-1 bg-background/50 font-semibold shadow-sm">
                  <DollarSign className="h-3 w-3 mr-1.5" />
                  {cost}
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Rationale */}
        <div className="mb-5 p-5 rounded-xl bg-gradient-to-br from-muted/80 to-muted/40 border border-border/50 backdrop-blur-sm">
          <p className="text-sm leading-relaxed text-foreground/80">{rationale}</p>
        </div>

        {/* Source Info */}
        <div className="flex flex-wrap gap-3 text-xs text-muted-foreground bg-background/30 p-4 rounded-lg">
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-background/50">
            <Calendar className="h-3.5 w-3.5" />
            <span>{format(new Date(sourceDate), 'MMM dd, yyyy')}</span>
          </div>
          <span className="text-muted-foreground/50">•</span>
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-background/50">
            <Building className="h-3.5 w-3.5" />
            <span>{sourceIndustry}</span>
          </div>
          <span className="text-muted-foreground/50">•</span>
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-background/50">
            <Users className="h-3.5 w-3.5" />
            <span>{sourceTeamSize}</span>
          </div>
          <span className="text-muted-foreground/50">•</span>
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-background/50">
            <Wallet className="h-3.5 w-3.5" />
            <span>{sourceBudget}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RecommendationCard;
