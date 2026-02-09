import { Badge } from "@/components/ui/badge";

interface Feature {
  name: string;
  free: boolean | string;
  premium: boolean | string;
  comingSoon?: boolean;
}

const features: Feature[] = [
  { name: "Scans per month", free: "3", premium: "Unlimited" },
  { name: "Business model detection", free: true, premium: true },
  { name: "Ideal Customer Profile (ICP)", free: true, premium: true },
  { name: "Audience channel analysis", free: true, premium: true },
  { name: "Website optimization tips", free: true, premium: true },
  { name: "Organic growth strategy", free: true, premium: true },
  { name: "Paid ad strategy", free: false, premium: true },
  { name: "Market size & opportunity", free: false, premium: true },
  { name: "Traffic data (SimilarWeb)", free: false, premium: true },
  { name: "PDF export", free: false, premium: true },
  { name: "Quick Wins summary", free: true, premium: true },
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
      <div className="flex items-center gap-1 justify-center">
        <span className="text-sm font-medium text-primary">Yes</span>
        {comingSoon && <Badge variant="outline" className="text-[10px]">Soon</Badge>}
      </div>
    );
  }
  if (comingSoon) {
    return (
      <div className="flex items-center gap-1 justify-center">
        <span className="text-sm text-muted-foreground/50">No</span>
        <Badge variant="outline" className="text-[10px]">Soon</Badge>
      </div>
    );
  }
  return <span className="text-sm text-muted-foreground/40">No</span>;
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
