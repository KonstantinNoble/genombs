import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface CitationsListProps {
  citations: Array<{
    url: string;
    title: string;
  }>;
}

export function CitationsList({ citations }: CitationsListProps) {
  if (!citations || citations.length === 0) return null;

  return (
    <Card className="bg-card/80 backdrop-blur-sm border-border/50">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold text-foreground">
          Sources
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ol className="space-y-2">
          {citations.map((citation, index) => (
            <li key={index} className="text-sm">
              <span className="text-muted-foreground mr-2">[{index + 1}]</span>
              <a
                href={citation.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline break-all"
              >
                {citation.title || citation.url}
              </a>
            </li>
          ))}
        </ol>
      </CardContent>
    </Card>
  );
}
