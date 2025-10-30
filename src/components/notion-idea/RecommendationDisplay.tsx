import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Trash2, Sparkles } from "lucide-react";
import { CombinedRecommendation } from "@/pages/NotionIdea";
import CategorySection from "./CategorySection";

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
    <div className="max-w-7xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20 mb-3">
              <Sparkles className="h-3 w-3 text-secondary animate-pulse" />
              <span className="text-xs font-semibold text-foreground">{recommendations.length} Total Items</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold mb-2 bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent">
              Your Business Roadmap
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
              Organized recommendations to guide your business strategy
            </p>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <Button variant="outline" onClick={onBackToSelection} className="flex-1 sm:flex-initial hover:bg-primary/10 hover:border-primary transition-all">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Import More
            </Button>
            <Button variant="destructive" onClick={onClearAll} className="flex-1 sm:flex-initial hover:scale-105 transition-transform">
              <Trash2 className="mr-2 h-4 w-4" />
              Clear All
            </Button>
          </div>
        </div>

        {/* Filters and Sorting */}
        <div className="flex flex-wrap gap-3 sm:gap-4 items-center bg-gradient-to-r from-muted/30 to-transparent p-4 rounded-xl border">
          <Tabs value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
            <TabsList className="bg-background/50 backdrop-blur-sm">
              <TabsTrigger value="all" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-primary/80">All</TabsTrigger>
              <TabsTrigger value="tools" className="data-[state=active]:bg-primary">Tools</TabsTrigger>
              <TabsTrigger value="ideas" className="data-[state=active]:bg-secondary">Ideas</TabsTrigger>
            </TabsList>
          </Tabs>

          <Tabs value={timeFilter} onValueChange={(v) => setTimeFilter(v as typeof timeFilter)}>
            <TabsList className="bg-background/50 backdrop-blur-sm">
              <TabsTrigger value="all">All Timeline</TabsTrigger>
              <TabsTrigger value="quick">Quick</TabsTrigger>
              <TabsTrigger value="medium">Medium</TabsTrigger>
              <TabsTrigger value="long">Long</TabsTrigger>
            </TabsList>
          </Tabs>

          <Select value={sortBy} onValueChange={(v) => setSortBy(v as typeof sortBy)}>
            <SelectTrigger className="w-[160px] sm:w-[180px] bg-background/50 backdrop-blur-sm">
              <SelectValue placeholder="Sort by..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="category">By Category</SelectItem>
              <SelectItem value="cost">By Cost</SelectItem>
              <SelectItem value="date">By Date</SelectItem>
            </SelectContent>
          </Select>

          <Badge variant="secondary" className="ml-auto bg-gradient-to-r from-secondary to-secondary/80 shadow-sm">
            <Sparkles className="h-3 w-3 mr-1" />
            {filteredRecommendations.length} shown
          </Badge>
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

      {/* General Advice Section */}
      {generalAdviceItems.length > 0 && (
        <div className="mt-12">
          <div className="flex items-center gap-3 mb-6 bg-gradient-to-r from-secondary/5 to-transparent p-3 rounded-lg">
            <div className="p-2 rounded-lg bg-secondary/10">
              <Sparkles className="h-6 w-6 text-secondary" />
            </div>
            <h2 className="text-2xl font-semibold">Strategic Insights</h2>
          </div>
          <div className="space-y-4">
            {generalAdviceItems.map((item, index) => (
              <div
                key={index}
                className="p-5 sm:p-6 rounded-xl border bg-gradient-to-br from-card to-muted/10 hover:shadow-elegant hover:border-secondary/30 transition-all duration-300"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <p className="text-sm sm:text-base leading-relaxed mb-4 text-foreground">{item.advice}</p>
                <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <Badge variant="outline" className="text-xs bg-primary/5">
                    {item.source.sourceIndustry}
                  </Badge>
                  <span className="text-muted-foreground/50">•</span>
                  <span>{item.source.sourceTeamSize}</span>
                  <span className="text-muted-foreground/50">•</span>
                  <span>{item.source.sourceBudget}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default RecommendationDisplay;
