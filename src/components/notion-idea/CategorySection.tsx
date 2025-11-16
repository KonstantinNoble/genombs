import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { CombinedRecommendation } from "@/pages/NotionIdea";
import RecommendationCard from "./RecommendationCard";

interface CategorySectionProps {
  category: string;
  recommendations: CombinedRecommendation[];
}

const CategorySection = ({ category, recommendations }: CategorySectionProps) => {
  const toolCount = recommendations.filter(r => r.type === 'tool').length;
  const ideaCount = recommendations.filter(r => r.type === 'idea').length;

  return (
    <Accordion type="single" collapsible defaultValue={category}>
      <AccordionItem value={category} className="border rounded-lg bg-card">
        <AccordionTrigger className="px-3 sm:px-6 py-3 sm:py-4 hover:no-underline group transition-all">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 flex-1 text-left">
            <h3 className="text-sm sm:text-lg font-semibold capitalize">{category}</h3>
            <div className="flex gap-1.5 sm:gap-2 flex-wrap">
              {toolCount > 0 && (
                <Badge variant="secondary" className="text-xs h-5 sm:h-6">
                  {toolCount} tool{toolCount !== 1 ? 's' : ''}
                </Badge>
              )}
              {ideaCount > 0 && (
                <Badge variant="outline" className="text-xs h-5 sm:h-6">
                  {ideaCount} idea{ideaCount !== 1 ? 's' : ''}
                </Badge>
              )}
            </div>
          </div>
        </AccordionTrigger>
        <AccordionContent className="px-3 sm:px-6 pb-3 sm:pb-6">
          <div className="space-y-3 sm:space-y-4 pt-2 sm:pt-4">
            {recommendations.map(rec => (
              <RecommendationCard key={rec.id} recommendation={rec} />
            ))}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

export default CategorySection;
