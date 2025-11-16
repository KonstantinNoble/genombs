import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CombinedRecommendation } from "@/pages/NotionIdea";
import CategorySection from "./CategorySection";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

// Helper: bring headings and bullets to line starts, collapse extra blanks
function normalizeMarkdown(md?: string) {
  if (!md) return "";
  let s = md.trim();

  // Ensure each heading starts on its own line (even if originally inline)
  s = s.replace(/(?:^|\s)(#{1,6}\s)/g, (_m, h) => `\n${h}`);

  // Ensure a blank line after headings
  s = s.replace(/(#{1,6}\s[^\n#]+)(?!\n)/g, "$1\n\n");

  // Convert inline dashes into real list items when followed by bold label
  s = s.replace(/[\s]+[\-–]\s+(?=\*\*)/g, "\n- ");

  // Ensure list bullets start on their own line
  s = s.replace(/\s(-\s)/g, "\n$1");

  // Collapse 3+ newlines to max 2
  s = s.replace(/\n{3,}/g, "\n\n");

  return s;
}

// Split by any ### heading occurrence (not only at line start)
function splitMarkdownSections(md: string) {
  const raw = (md || "").trim();
  if (!raw) return [] as { title: string; content: string }[];

  const parts = raw.split(/(?=###\s)/g).filter(Boolean);

  return parts.map((part) => {
    const headingMatch = part.match(/^###\s+(.+?)(?:\s+-\s+|\n|$)/);
    const title = headingMatch ? headingMatch[1].trim() : "Section";
    let content = part.replace(/^###\s+(.+?)(?:\s+-\s+|\n|$)/, "").trim();

    content = normalizeMarkdown(content);

    return { title, content };
  });
}

interface RecommendationDisplayProps {
  recommendations: CombinedRecommendation[];
  onBackToSelection: () => void;
  onClearAll: () => void;
}

const RecommendationDisplay = ({
  recommendations,
  onBackToSelection,
  onClearAll
}: RecommendationDisplayProps) => {
  const [filter, setFilter] = useState<'all' | 'tools' | 'ideas'>('all');
  const [timeFilter, setTimeFilter] = useState<'all' | 'quick' | 'medium' | 'long'>('all');
  const [sortBy, setSortBy] = useState<'category' | 'cost' | 'date'>('category');

  const filteredRecommendations = useMemo(() => {
    let filtered = [...recommendations];

    // Type filter
    if (filter === 'tools') {
      filtered = filtered.filter(r => r.type === 'tool');
    } else if (filter === 'ideas') {
      filtered = filtered.filter(r => r.type === 'idea');
    }

    // Time filter
    if (timeFilter !== 'all') {
      filtered = filtered.filter(r => {
        if (r.type === 'tool' && r.implementation) {
          if (timeFilter === 'quick') return r.implementation === 'quick-win';
          if (timeFilter === 'medium') return r.implementation === 'medium-term';
          if (timeFilter === 'long') return r.implementation === 'strategic';
        }
        if (r.type === 'idea' && r.viability) {
          if (timeFilter === 'quick') return r.viability === 'quick-launch';
          if (timeFilter === 'medium') return r.viability === 'medium-term';
          if (timeFilter === 'long') return r.viability === 'long-term';
        }
        return false;
      });
    }

    // Sorting
    if (sortBy === 'cost') {
      filtered.sort((a, b) => {
        const costA = a.estimatedCost || a.estimatedInvestment || '0';
        const costB = b.estimatedCost || b.estimatedInvestment || '0';
        return costA.localeCompare(costB);
      });
    } else if (sortBy === 'date') {
      filtered.sort((a, b) => 
        new Date(b.sourceDate).getTime() - new Date(a.sourceDate).getTime()
      );
    } else {
      filtered.sort((a, b) => a.category.localeCompare(b.category));
    }

    return filtered;
  }, [recommendations, filter, timeFilter, sortBy]);

  const groupedByCategory = useMemo(() => {
    const groups: { [key: string]: CombinedRecommendation[] } = {};
    
    filteredRecommendations.forEach(rec => {
      if (!groups[rec.category]) {
        groups[rec.category] = [];
      }
      groups[rec.category].push(rec);
    });

    return groups;
  }, [filteredRecommendations]);

  const generalAdviceItems = useMemo(() => {
    const uniqueAdvice = new Map<string, { advice: string; source: CombinedRecommendation }>();
    
    recommendations.forEach(rec => {
      if (rec.generalAdvice && !uniqueAdvice.has(rec.generalAdvice)) {
        uniqueAdvice.set(rec.generalAdvice, { advice: rec.generalAdvice, source: rec });
      }
    });

    return Array.from(uniqueAdvice.values());
  }, [recommendations]);

  return (
    <div className="max-w-7xl mx-auto animate-fade-in px-3 sm:px-4">
      {/* Header */}
      <div className="mb-4 sm:mb-8">
        <div className="flex flex-col gap-3 sm:gap-4 mb-4">
          <div className="w-full">
            <h1 className="text-xl sm:text-4xl font-bold mb-1 sm:mb-2 text-foreground">
              Your Business Roadmap
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              {recommendations.length} recommendations
            </p>
          </div>
          <div className="flex gap-2 w-full">
            <Button 
              variant="outline" 
              onClick={onBackToSelection} 
              className="flex-1 text-xs sm:text-sm h-9 sm:h-10 px-3"
            >
              ← Import
            </Button>
            <Button 
              variant="destructive" 
              onClick={onClearAll} 
              className="flex-1 text-xs sm:text-sm h-9 sm:h-10 px-3 bg-red-600 hover:bg-red-700 text-white font-semibold"
            >
              Delete All
            </Button>
          </div>
        </div>

        {/* Filters and Sorting */}
        <div className="flex flex-col gap-2 sm:gap-3">
          <Tabs value={filter} onValueChange={(v) => setFilter(v as typeof filter)} className="w-full">
            <TabsList className="grid grid-cols-3 w-full h-9 sm:h-10">
              <TabsTrigger value="all" className="text-sm">All</TabsTrigger>
              <TabsTrigger value="tools" className="text-sm">Tools</TabsTrigger>
              <TabsTrigger value="ideas" className="text-sm">Ideas</TabsTrigger>
            </TabsList>
          </Tabs>

          <Tabs value={timeFilter} onValueChange={(v) => setTimeFilter(v as typeof timeFilter)} className="w-full">
            <TabsList className="grid grid-cols-4 w-full h-9 sm:h-10">
              <TabsTrigger value="all" className="text-sm">All</TabsTrigger>
              <TabsTrigger value="quick" className="text-sm">Quick</TabsTrigger>
              <TabsTrigger value="medium" className="text-sm">Med</TabsTrigger>
              <TabsTrigger value="long" className="text-sm">Long</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex items-center gap-2 w-full">
            <Select value={sortBy} onValueChange={(v) => setSortBy(v as typeof sortBy)}>
              <SelectTrigger className="flex-1 text-sm h-9 sm:h-10">
                <SelectValue placeholder="Sort by..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="category">Category</SelectItem>
                <SelectItem value="cost">Cost</SelectItem>
                <SelectItem value="date">Date</SelectItem>
              </SelectContent>
            </Select>

            <Badge variant="secondary" className="text-sm whitespace-nowrap px-2 py-1.5 h-9 flex items-center">
              {filteredRecommendations.length}
            </Badge>
          </div>
        </div>
      </div>

      {/* Recommendations by Category */}
      <div className="space-y-3 sm:space-y-6 mb-6 sm:mb-8">
        {Object.entries(groupedByCategory).map(([category, recs]) => (
          <CategorySection
            key={category}
            category={category}
            recommendations={recs}
          />
        ))}
      </div>

      {/* Strategic Overview Section */}
      {generalAdviceItems.length > 0 && (
        <div className="mt-8 sm:mt-12">
          <h2 className="text-xl sm:text-3xl font-bold mb-4 sm:mb-6 text-foreground">Strategic Overview</h2>
          <div className="space-y-4 sm:space-y-6">
            {generalAdviceItems.map((item, index) => {
              const sections = splitMarkdownSections(item.advice);
              return (
                <div key={index} className="space-y-3 sm:space-y-4">
                  {sections.map((sec, i) => (
                    <div key={i} className="p-4 sm:p-6 rounded-lg border bg-card sm:bg-gradient-to-br sm:from-card sm:to-secondary/5 border-secondary/20 transition-colors shadow-md">
                      <h3 className="text-base sm:text-xl font-semibold mb-3 sm:mb-4 text-foreground">{sec.title}</h3>
                      <div className="prose prose-sm max-w-none">
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          components={{
                            h2: ({ children }) => <h2 className="text-lg sm:text-xl font-semibold mt-4 mb-3 text-foreground">{children}</h2>,
                            h3: ({ children }) => <h3 className="text-base sm:text-lg font-semibold mt-3 mb-2 text-foreground">{children}</h3>,
                            h4: ({ children }) => <h4 className="text-sm sm:text-base font-semibold mt-2 mb-2 text-foreground">{children}</h4>,
                            p: ({ children }) => <p className="text-sm sm:text-base leading-relaxed mb-3 text-foreground break-words">{children}</p>,
                            ul: ({ children }) => <ul className="list-disc pl-5 mb-3 space-y-1.5 text-foreground text-sm sm:text-base">{children}</ul>,
                            ol: ({ children }) => <ol className="list-decimal pl-5 mb-3 space-y-1.5 text-foreground text-sm sm:text-base">{children}</ol>,
                            li: ({ children }) => <li className="text-sm sm:text-base leading-relaxed break-words">{children}</li>,
                            strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
                            em: ({ children }) => <em className="italic text-foreground">{children}</em>,
                            a: ({ children, href }) => <a href={href} className="underline break-words text-primary" target="_blank" rel="noreferrer">{children}</a>,
                            pre: ({ children }) => <pre className="overflow-x-auto rounded-md p-3 bg-muted text-xs sm:text-sm">{children}</pre>,
                            code: ({ children }) => <code className="break-all">{children}</code>,
                            table: ({ children }) => <div className="overflow-x-auto"><table className="min-w-full text-left text-xs sm:text-sm">{children}</table></div>,
                            thead: ({ children }) => <thead className="border-b">{children}</thead>,
                            tbody: ({ children }) => <tbody>{children}</tbody>,
                            tr: ({ children }) => <tr className="border-b last:border-0">{children}</tr>,
                            th: ({ children }) => <th className="px-2 py-1 sm:px-3 sm:py-2 font-semibold">{children}</th>,
                            td: ({ children }) => <td className="px-2 py-1 sm:px-3 sm:py-2 align-top">{children}</td>,
                          }}
                        >
                          {normalizeMarkdown(sec.content)}
                        </ReactMarkdown>
                      </div>
                    </div>
                  ))}
                  <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-xs text-muted-foreground mt-2">
                    <Badge variant="outline" className="text-xs">
                      {item.source.sourceIndustry}
                    </Badge>
                    <span className="hidden sm:inline">•</span>
                    <span className="text-xs">{item.source.sourceTeamSize}</span>
                    <span className="hidden sm:inline">•</span>
                    <span className="text-xs">{item.source.sourceBudget}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default RecommendationDisplay;
