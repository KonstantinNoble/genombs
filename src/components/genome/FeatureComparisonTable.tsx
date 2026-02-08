import { Check, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Feature {
  name: string;
  free: boolean | string;
  premium: boolean | string;
  comingSoon?: boolean;
}

const features: Feature[] = [
  { name: "Analyses per month", free: "3", premium: "Unlimited" },
  { name: "Business model detection", free: true, premium: true },
  { name: "Offer structure analysis", free: true, premium: true },
  { name: "Audience clusters", free: true, premium: true },
  { name: "Funnel type recognition", free: true, premium: true },
  { name: "Channel usage analysis", free: true, premium: true },
  { name: "Content formats", free: true, premium: true },
  { name: "Trust elements", free: true, premium: true },
  { name: "Messaging & USPs", free: true, premium: true },
  { name: "Traffic data (SimilarWeb)", free: false, premium: true },
  { name: "PDF export", free: false, premium: true },
  { name: "Recommendations", free: false, premium: true },
  { name: "Competitor analysis", free: false, premium: true, comingSoon: true },
  { name: "API access", free: false, premium: false, comingSoon: true },
  { name: "Priority support", free: false, premium: true },
];

const renderCell = (value: boolean | string, comingSoon?: boolean) => {
  if (typeof value === "string") {
    return (
      <span className="text-sm font-medium text-foreground">{value}</span>
    );
  }
  if (value) {
    return (
      <div className="flex items-center gap-1">
        <Check className="w-4 h-4 text-primary" />
        {comingSoon && <Badge variant="outline" className="text-[10px]">Soon</Badge>}
      </div>
    );
  }
  return <X className="w-4 h-4 text-muted-foreground/40" />;
};

const FeatureComparisonTable = () => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border">
            <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Feature</th>
            <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">Free</th>
            <th className="text-center py-3 px-4 text-sm font-medium text-primary">Premium</th>
          </tr>
        </thead>
        <tbody>
          {features.map((feature) => (
            <tr key={feature.name} className="border-b border-border/50">
              <td className="py-3 px-4 text-sm text-foreground">{feature.name}</td>
              <td className="py-3 px-4 text-center">
                <div className="flex justify-center">
                  {renderCell(feature.free)}
                </div>
              </td>
              <td className="py-3 px-4 text-center">
                <div className="flex justify-center">
                  {renderCell(feature.premium, feature.comingSoon)}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default FeatureComparisonTable;
