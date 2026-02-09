import { Card, CardContent } from "@/components/ui/card";

interface StatCardProps {
  label: string;
  value: string | number;
  trend?: string;
  children?: React.ReactNode;
}

const StatCard = ({ label, value, trend, children }: StatCardProps) => {
  return (
    <Card className="border-border bg-card">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <span className="w-2 h-2 rounded-full bg-primary mt-1" />
          {trend && (
            <span className="text-xs font-medium text-primary">{trend}</span>
          )}
        </div>
        <p className="text-2xl font-bold text-foreground">{value}</p>
        <p className="text-xs text-muted-foreground mt-1">{label}</p>
        {children}
      </CardContent>
    </Card>
  );
};

export default StatCard;
