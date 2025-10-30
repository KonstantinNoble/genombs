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
    <Card className="hover:shadow-lg transition-all duration-300 border-l-4" 
          style={{ borderLeftColor: type === 'tool' ? 'hsl(var(--primary))' : 'hsl(var(--secondary))' }}>
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex items-start gap-3 mb-4">
          <div className={`p-2 rounded-lg ${type === 'tool' ? 'bg-primary/10' : 'bg-secondary/10'}`}>
            {type === 'tool' ? (
              <Wrench className="h-5 w-5 text-primary" />
            ) : (
              <Lightbulb className="h-5 w-5 text-secondary" />
            )}
          </div>
          <div className="flex-1">
            <h4 className="text-lg font-semibold mb-2">{name}</h4>
            <div className="flex flex-wrap gap-2">
              {timeline && (
                <Badge className={getTimelineBadgeColor(timeline)}>
                  <Clock className="h-3 w-3 mr-1" />
                  {timeline.split('-').map(word => 
                    word.charAt(0).toUpperCase() + word.slice(1)
                  ).join(' ')}
                </Badge>
              )}
              {cost && (
                <Badge variant="outline">
                  <DollarSign className="h-3 w-3 mr-1" />
                  {cost}
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Rationale */}
        <div className="mb-4 p-4 rounded-lg bg-muted/50">
          <p className="text-sm leading-relaxed text-muted-foreground">{rationale}</p>
        </div>

        {/* Source Info */}
        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            <span>{format(new Date(sourceDate), 'MMM dd, yyyy')}</span>
          </div>
          <span>•</span>
          <div className="flex items-center gap-1">
            <Building className="h-3 w-3" />
            <span>{sourceIndustry}</span>
          </div>
          <span>•</span>
          <div className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            <span>{sourceTeamSize}</span>
          </div>
          <span>•</span>
          <div className="flex items-center gap-1">
            <Wallet className="h-3 w-3" />
            <span>{sourceBudget}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RecommendationCard;
