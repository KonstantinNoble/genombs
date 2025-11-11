import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { TrendingUp } from "lucide-react";
import { CombinedRecommendation } from "@/pages/NotionIdea";
import { format } from "date-fns";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

// Helper: bring headings and bullets to line starts, collapse extra blanks
function normalizeMarkdown(md?: string) {
  if (!md) return "";
  let s = md.trim();

  // Ensure each heading starts on its own line (even if originally inline)
  s = s.replace(/(?:^|\s)(#{1,6}\s)/g, (_m, h) => `\n${h}`);

  // Ensure a blank line after headings
  s = s.replace(/(#{1,6}\s[^\n#]+)(?!\n)/g, "$1\n\n");

  // Convert inline dashes into real list items when followed by bold label
  s = s.replace(/[\s]+[\-–]\s+(?=\*\*)/g, "\n- ");

  // Ensure list bullets start on their own line
  s = s.replace(/\s(-\s)/g, "\n$1");

  // Collapse 3+ newlines to max 2
  s = s.replace(/\n{3,}/g, "\n\n");

  return s;
}

interface RecommendationCardProps {
  recommendation: CombinedRecommendation & {
    detailedSteps?: string[];
    expectedROI?: string;
    riskLevel?: "low" | "medium" | "high";
    prerequisites?: string[];
    metrics?: string[];
    implementationTimeline?: string;
  };
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
          <div className="prose prose-sm max-w-none">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                h2: ({ children }) => (
                  <h2 className="text-lg sm:text-xl font-semibold mt-5 mb-3 text-foreground">{children}</h2>
                ),
                h3: ({ children }) => (
                  <h3 className="text-base sm:text-lg font-semibold mt-4 mb-2 text-foreground">{children}</h3>
                ),
                h4: ({ children }) => (
                  <h4 className="text-sm sm:text-base font-semibold mt-3 mb-2 text-foreground">{children}</h4>
                ),
                p: ({ children }) => (
                  <p className="text-sm sm:text-base leading-relaxed text-foreground mb-3 last:mb-0">{children}</p>
                ),
                strong: ({ children }) => (
                  <strong className="font-semibold text-foreground">{children}</strong>
                ),
                em: ({ children }) => (
                  <em className="italic text-foreground">{children}</em>
                ),
                ul: ({ children }) => (
                  <ul className="list-disc pl-5 mb-3 space-y-1.5 text-foreground text-sm sm:text-base">{children}</ul>
                ),
                ol: ({ children }) => (
                  <ol className="list-decimal pl-5 mb-3 space-y-1.5 text-foreground text-sm sm:text-base">{children}</ol>
                ),
                li: ({ children }) => (
                  <li className="text-sm sm:text-base leading-relaxed">{children}</li>
                ),
              }}
            >
              {normalizeMarkdown(rationale)}
            </ReactMarkdown>
          </div>
        </div>

        {/* Deep Analysis Fields */}
        {recommendation.expectedROI && (
          <div className="mb-3 p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
            <p className="text-sm font-semibold text-green-800 dark:text-green-400 flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Expected ROI: {recommendation.expectedROI}
            </p>
          </div>
        )}

        {recommendation.riskLevel && (
          <div className="mb-3">
            <Badge variant={
              recommendation.riskLevel === 'low' ? 'default' : 
              recommendation.riskLevel === 'medium' ? 'secondary' : 'destructive'
            }>
              Risk: {recommendation.riskLevel}
            </Badge>
            {recommendation.implementationTimeline && (
              <Badge variant="outline" className="ml-2">
                Timeline: {recommendation.implementationTimeline}
              </Badge>
            )}
          </div>
        )}

        {recommendation.detailedSteps && recommendation.detailedSteps.length > 0 && (
          <Accordion type="single" collapsible className="mb-3">
            <AccordionItem value="steps">
              <AccordionTrigger className="text-sm">Implementation Steps</AccordionTrigger>
              <AccordionContent>
                <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                  {recommendation.detailedSteps.map((step, i) => (
                    <li key={i}>{step}</li>
                  ))}
                </ol>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        )}

        {recommendation.prerequisites && recommendation.prerequisites.length > 0 && (
          <Accordion type="single" collapsible className="mb-3">
            <AccordionItem value="prerequisites">
              <AccordionTrigger className="text-sm">Prerequisites</AccordionTrigger>
              <AccordionContent>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                  {recommendation.prerequisites.map((prereq, i) => (
                    <li key={i}>{prereq}</li>
                  ))}
                </ul>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        )}

        {recommendation.metrics && recommendation.metrics.length > 0 && (
          <Accordion type="single" collapsible className="mb-3">
            <AccordionItem value="metrics">
              <AccordionTrigger className="text-sm">Success Metrics</AccordionTrigger>
              <AccordionContent>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                  {recommendation.metrics.map((metric, i) => (
                    <li key={i}>{metric}</li>
                  ))}
                </ul>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        )}

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
