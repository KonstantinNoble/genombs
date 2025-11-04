import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CombinedRecommendation } from "@/pages/NotionIdea";
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
      <CardContent className="p-4 sm:p-6">
        {/* Header */}
        <div className="flex items-start gap-2 sm:gap-3 mb-3 sm:mb-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant={type === 'tool' ? 'default' : 'secondary'} className="text-xs">
                {type === 'tool' ? 'Tool' : 'Idea'}
              </Badge>
            </div>
            <h4 className="text-base sm:text-lg font-semibold mb-2 break-words">{name}</h4>
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              {timeline && (
                <Badge className={`${getTimelineBadgeColor(timeline)} text-xs`}>
                  <span className="hidden sm:inline">{timeline.split('-').map(word => 
                    word.charAt(0).toUpperCase() + word.slice(1)
                  ).join(' ')}</span>
                  <span className="sm:hidden">{timeline.includes('quick') ? 'Quick' : timeline.includes('medium') ? 'Medium' : 'Long'}</span>
                </Badge>
              )}
              {cost && (
                <Badge variant="outline" className="text-xs">
                  {cost}
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Rationale */}
        <div className="mb-3 sm:mb-4 p-3 sm:p-4 rounded-lg bg-muted/50">
          <p className="text-xs sm:text-sm leading-relaxed text-muted-foreground">{rationale}</p>
        </div>

        {/* Source Info */}
        <div className="flex flex-wrap gap-1.5 sm:gap-2 text-xs text-muted-foreground">
          <span className="hidden sm:inline">{format(new Date(sourceDate), 'MMM dd, yyyy')}</span>
          <span className="sm:hidden">{format(new Date(sourceDate), 'MMM dd')}</span>
          <span className="hidden sm:inline">•</span>
          <span className="truncate max-w-[100px] sm:max-w-none">{sourceIndustry}</span>
          <span className="hidden sm:inline">•</span>
          <span className="truncate max-w-[80px] sm:max-w-none">{sourceTeamSize}</span>
          <span className="hidden sm:inline">•</span>
          <span className="truncate max-w-[80px] sm:max-w-none">{sourceBudget}</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default RecommendationCard;
