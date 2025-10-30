import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { CombinedRecommendation } from "@/pages/NotionIdea";
import RecommendationCard from "./RecommendationCard";
import { 
  Wrench, 
  Megaphone, 
  TrendingUp, 
  DollarSign, 
  Users, 
  Settings,
  Target,
  Package,
  Briefcase,
  Cloud,
  Globe,
  MessageSquare,
  ShoppingCart,
  Lightbulb
} from "lucide-react";

interface CategorySectionProps {
  category: string;
  recommendations: CombinedRecommendation[];
}

const getCategoryIcon = (category: string) => {
  const icons: { [key: string]: any } = {
    productivity: Wrench,
    marketing: Megaphone,
    sales: TrendingUp,
    finance: DollarSign,
    hr: Users,
    operations: Settings,
    strategy: Target,
    product: Package,
    service: Briefcase,
    saas: Cloud,
    marketplace: Globe,
    content: MessageSquare,
    ecommerce: ShoppingCart,
    consulting: Lightbulb
  };
  
  return icons[category.toLowerCase()] || Package;
};

const getCategoryColor = (category: string): string => {
  const colors: { [key: string]: string } = {
    productivity: "hsl(var(--primary))",
    marketing: "hsl(var(--secondary))",
    sales: "hsl(142, 76%, 36%)",
    finance: "hsl(221, 83%, 53%)",
    hr: "hsl(280, 65%, 60%)",
    operations: "hsl(24, 80%, 50%)",
    strategy: "hsl(340, 82%, 52%)",
    product: "hsl(262, 83%, 58%)",
    service: "hsl(199, 89%, 48%)",
    saas: "hsl(142, 71%, 45%)",
    marketplace: "hsl(45, 93%, 47%)",
    content: "hsl(280, 67%, 55%)",
    ecommerce: "hsl(24, 95%, 53%)",
    consulting: "hsl(217, 91%, 60%)"
  };
  
  return colors[category.toLowerCase()] || "hsl(var(--primary))";
};

const CategorySection = ({ category, recommendations }: CategorySectionProps) => {
  const Icon = getCategoryIcon(category);
  const color = getCategoryColor(category);
  const toolCount = recommendations.filter(r => r.type === 'tool').length;
  const ideaCount = recommendations.filter(r => r.type === 'idea').length;

  return (
    <Accordion type="single" collapsible defaultValue={category}>
      <AccordionItem value={category} className="border rounded-xl bg-gradient-to-br from-card to-muted/5 shadow-sm hover:shadow-elegant transition-all">
        <AccordionTrigger className="px-5 sm:px-6 hover:no-underline group">
          <div className="flex items-center gap-3 flex-1">
            <div 
              className="p-2.5 rounded-xl transition-all duration-300 group-hover:scale-110 shadow-sm"
              style={{ 
                backgroundColor: `${color}15`,
                boxShadow: `0 0 20px ${color}10`
              }}
            >
              <Icon className="h-5 w-5" style={{ color }} />
            </div>
            <div className="flex items-center gap-3 flex-1">
              <h3 className="text-base sm:text-lg font-semibold capitalize">{category}</h3>
              <div className="flex gap-2">
                {toolCount > 0 && (
                  <Badge variant="secondary" className="text-xs bg-primary/10 text-primary border-primary/20">
                    {toolCount} tool{toolCount !== 1 ? 's' : ''}
                  </Badge>
                )}
                {ideaCount > 0 && (
                  <Badge variant="outline" className="text-xs bg-secondary/10 text-secondary border-secondary/20">
                    {ideaCount} idea{ideaCount !== 1 ? 's' : ''}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </AccordionTrigger>
        <AccordionContent className="px-5 sm:px-6 pb-6">
          <div className="space-y-4 pt-4 border-t border-border/50">
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
