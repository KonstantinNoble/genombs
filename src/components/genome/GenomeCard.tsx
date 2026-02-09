import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface GenomeCardProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

const GenomeCard = ({ title, children, className = "" }: GenomeCardProps) => {
  return (
    <Card className={`border-border bg-card ${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="text-xl font-semibold text-foreground">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
};

export default GenomeCard;
