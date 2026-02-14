import { Badge } from "@/components/ui/badge";

interface Feature {
  name: string;
  free: boolean | string;
  premium: boolean | string;
  comingSoon?: boolean;
}

const features: Feature[] = [
  { name: "Daily credits", free: "20", premium: "100" },
  { name: "Daily credit reset", free: true, premium: true },
  { name: "AI models", free: "2 (Gemini Flash, GPT Mini)", premium: "All 5" },
  { name: "Competitor URLs", free: "1", premium: "Up to 3" },
  { name: "Scoring categories", free: "5", premium: "5" },
  { name: "PageSpeed Insights", free: true, premium: true },
  { name: "AI Chat", free: true, premium: true },
  { name: "Premium models (GPT-4o, Claude, Perplexity)", free: false, premium: true },
  { name: "API access", free: false, premium: false, comingSoon: true },
];

const renderCell = (value: boolean | string, comingSoon?: boolean) => {
  if (typeof value === "string") {
    return (
      <span className="text-sm font-semibold text-foreground">{value}</span>
    );
  }
  if (value) {
    return (
      <div className="flex items-center gap-1.5 justify-center">
        <span className="text-sm font-semibold text-primary">Yes</span>
        {comingSoon && <Badge variant="outline" className="text-[10px]">Soon</Badge>}
      </div>
    );
  }
  if (comingSoon) {
    return (
      <div className="flex items-center gap-1.5 justify-center">
        <span className="text-sm text-muted-foreground/30">—</span>
        <Badge variant="outline" className="text-[10px]">Soon</Badge>
      </div>
    );
  }
  return <span className="text-sm text-muted-foreground/30">—</span>;
};

const FeatureComparisonTable = () => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border bg-muted/30">
            <th className="text-left py-4 px-5 text-sm font-medium text-muted-foreground">Feature</th>
            <th className="text-center py-4 px-5 text-sm font-medium text-muted-foreground">Free</th>
            <th className="text-center py-4 px-5 text-sm font-bold text-primary">Premium</th>
          </tr>
        </thead>
        <tbody>
          {features.map((feature, i) => (
            <tr
              key={feature.name}
              className={`${i < features.length - 1 ? "border-b border-border/40" : ""} ${
                i % 2 === 0 ? "bg-muted/10" : ""
              }`}
            >
              <td className="py-3.5 px-5 text-sm text-foreground font-medium">{feature.name}</td>
              <td className="py-3.5 px-5 text-center">
                <div className="flex justify-center">
                  {renderCell(feature.free)}
                </div>
              </td>
              <td className="py-3.5 px-5 text-center">
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
