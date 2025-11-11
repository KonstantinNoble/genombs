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

  // Ensure each heading starts on its own line
  s = s.replace(/\s*(#{1,6}\s)/g, "\n$1");

  // Ensure each bullet starts on its own line
  s = s.replace(/\s*(-\s)/g, "\n$1");

  // Collapse 3+ newlines to max 2
  s = s.replace(/\n{3,}/g, "\n\n");

  return s;
}

// Split by top-level ### sections
function splitMarkdownSections(md: string) {
  const normalized = normalizeMarkdown(md);
  const parts = normalized.split(/\n(?=###\s)/g).filter(Boolean);

  return parts.map(part => {
    const lines = part.split("\n");
    const titleLine = lines[0].startsWith("### ") ? lines[0].slice(4).trim() : "Section";
    const content = lines.slice(1).join("\n").trim();
    return { title: titleLine, content };
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
    <div className="max-w-7xl mx-auto animate-fade-in px-2 sm:px-4">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
          <div className="w-full sm:w-auto">
            <h1 className="text-2xl sm:text-4xl font-bold mb-2 text-foreground">
              Your Business Roadmap
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Organized recommendations from {recommendations.length} total items
            </p>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <Button variant="outline" onClick={onBackToSelection} className="flex-1 sm:flex-none text-xs sm:text-sm">
              <span className="hidden sm:inline">← Import More</span>
              <span className="sm:hidden">← Import</span>
            </Button>
            <Button variant="destructive" onClick={onClearAll} className="flex-1 sm:flex-none text-xs sm:text-sm">
              <span className="hidden sm:inline">Clear All</span>
              <span className="sm:hidden">Clear</span>
            </Button>
          </div>
        </div>

        {/* Filters and Sorting */}
        <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 items-stretch sm:items-center">
          <Tabs value={filter} onValueChange={(v) => setFilter(v as typeof filter)} className="w-full sm:w-auto">
            <TabsList className="grid grid-cols-3 w-full sm:w-auto">
              <TabsTrigger value="all" className="text-xs sm:text-sm">All</TabsTrigger>
              <TabsTrigger value="tools" className="text-xs sm:text-sm">Tools</TabsTrigger>
              <TabsTrigger value="ideas" className="text-xs sm:text-sm">Ideas</TabsTrigger>
            </TabsList>
          </Tabs>

          <Tabs value={timeFilter} onValueChange={(v) => setTimeFilter(v as typeof timeFilter)} className="w-full sm:w-auto">
            <TabsList className="grid grid-cols-4 w-full sm:w-auto">
              <TabsTrigger value="all" className="text-xs sm:text-sm">All</TabsTrigger>
              <TabsTrigger value="quick" className="text-xs sm:text-sm">Quick</TabsTrigger>
              <TabsTrigger value="medium" className="text-xs sm:text-sm">Medium</TabsTrigger>
              <TabsTrigger value="long" className="text-xs sm:text-sm">Long</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Select value={sortBy} onValueChange={(v) => setSortBy(v as typeof sortBy)}>
              <SelectTrigger className="w-full sm:w-[180px] text-xs sm:text-sm">
                <SelectValue placeholder="Sort by..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="category">By Category</SelectItem>
                <SelectItem value="cost">By Cost</SelectItem>
                <SelectItem value="date">By Date</SelectItem>
              </SelectContent>
            </Select>

            <Badge variant="secondary" className="text-xs sm:text-sm whitespace-nowrap">
              {filteredRecommendations.length} items
            </Badge>
          </div>
        </div>
      </div>

      {/* Recommendations by Category */}
      <div className="space-y-6 mb-8">
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
        <div className="mt-12">
          <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-foreground">Strategic Overview</h2>
          <div className="space-y-6">
            {generalAdviceItems.map((item, index) => {
              const sections = splitMarkdownSections(item.advice);
              return (
                <div key={index} className="space-y-4">
                  {sections.map((sec, i) => (
                    <div key={i} className="p-5 sm:p-6 rounded-lg border bg-card/60 hover:bg-card transition-colors shadow-sm">
                      <h3 className="text-lg sm:text-xl font-semibold mb-4 text-foreground">{sec.title}</h3>
                      <div className="prose prose-sm max-w-none">
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          components={{
                            h2: ({ children }) => <h2 className="text-base sm:text-lg font-semibold mt-5 mb-3 text-foreground">{children}</h2>,
                            h3: ({ children }) => <h3 className="text-sm sm:text-base font-semibold mt-4 mb-2 text-foreground">{children}</h3>,
                            h4: ({ children }) => <h4 className="text-sm font-semibold mt-3 mb-2 text-foreground">{children}</h4>,
                            p: ({ children }) => <p className="text-sm leading-relaxed mb-3 text-foreground/95">{children}</p>,
                            ul: ({ children }) => <ul className="list-disc pl-5 mb-3 space-y-1.5 text-foreground/95">{children}</ul>,
                            ol: ({ children }) => <ol className="list-decimal pl-5 mb-3 space-y-1.5 text-foreground/95">{children}</ol>,
                            li: ({ children }) => <li className="text-sm leading-relaxed">{children}</li>,
                            strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
                            em: ({ children }) => <em className="italic text-foreground/95">{children}</em>,
                          }}
                        >
                          {normalizeMarkdown(sec.content)}
                        </ReactMarkdown>
                      </div>
                    </div>
                  ))}
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2">
                    <Badge variant="outline" className="text-xs">
                      {item.source.sourceIndustry}
                    </Badge>
                    <span>•</span>
                    <span>{item.source.sourceTeamSize}</span>
                    <span>•</span>
                    <span>{item.source.sourceBudget}</span>
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
