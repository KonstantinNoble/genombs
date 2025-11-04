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
      <AccordionItem value={category} className="border rounded-lg">
        <AccordionTrigger className="px-6 hover:no-underline group">
          <div className="flex items-center gap-3 flex-1">
            <div className="flex items-center gap-3 flex-1">
              <h3 className="text-lg font-semibold capitalize">{category}</h3>
              <div className="flex gap-2">
                {toolCount > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    {toolCount} tool{toolCount !== 1 ? 's' : ''}
                  </Badge>
                )}
                {ideaCount > 0 && (
                  <Badge variant="outline" className="text-xs">
                    {ideaCount} idea{ideaCount !== 1 ? 's' : ''}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </AccordionTrigger>
        <AccordionContent className="px-6 pb-6">
          <div className="space-y-4 pt-4">
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
