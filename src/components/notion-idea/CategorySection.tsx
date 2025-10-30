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
      <AccordionItem value={category} className="border rounded-2xl bg-gradient-to-br from-card to-card/50 shadow-elegant hover:shadow-glow transition-all duration-500 overflow-hidden">
        <AccordionTrigger className="px-8 py-5 hover:no-underline group">
          <div className="flex items-center gap-4 flex-1">
            <div 
              className="p-3 rounded-xl transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 shadow-sm"
              style={{ 
                backgroundColor: `${color}15`,
                boxShadow: `0 4px 12px ${color}25`
              }}
            >
              <Icon className="h-6 w-6" style={{ color }} />
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 flex-1">
              <h3 className="text-xl font-bold capitalize group-hover:translate-x-1 transition-transform" style={{ color }}>
                {category}
              </h3>
              <div className="flex gap-2 flex-wrap">
                {toolCount > 0 && (
                  <Badge variant="secondary" className="text-xs px-3 py-1 bg-primary/10 text-primary border-primary/20 font-semibold">
                    {toolCount} tool{toolCount !== 1 ? 's' : ''}
                  </Badge>
                )}
                {ideaCount > 0 && (
                  <Badge variant="outline" className="text-xs px-3 py-1 bg-secondary/10 text-secondary border-secondary/20 font-semibold">
                    {ideaCount} idea{ideaCount !== 1 ? 's' : ''}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </AccordionTrigger>
        <AccordionContent className="px-8 pb-8">
          <div className="space-y-5 pt-6">
            {recommendations.map((rec, index) => (
              <div 
                key={rec.id} 
                className="animate-fade-in"
                style={{ animationDelay: `${index * 0.05}s`, animationFillMode: 'backwards' }}
              >
                <RecommendationCard recommendation={rec} />
              </div>
            ))}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

export default CategorySection;
