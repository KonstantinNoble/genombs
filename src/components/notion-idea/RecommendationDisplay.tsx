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
    <div className="max-w-7xl mx-auto animate-fade-in relative">
      {/* Animated background */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-secondary/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* Header */}
      <div className="mb-10">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-6 p-6 rounded-2xl bg-gradient-to-br from-card to-card/50 border shadow-elegant backdrop-blur-sm">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent">
                Your Business Roadmap
              </h1>
            </div>
            <p className="text-lg text-muted-foreground">
              Organized recommendations from <span className="font-semibold text-primary">{recommendations.length}</span> total items
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={onBackToSelection} className="hover:shadow-md transition-all hover:border-primary/50">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Import More
            </Button>
            <Button variant="destructive" onClick={onClearAll} className="hover:shadow-md transition-all">
              <Trash2 className="mr-2 h-4 w-4" />
              Clear All
            </Button>
          </div>
        </div>

        {/* Filters and Sorting */}
        <div className="flex flex-wrap gap-4 items-center p-5 rounded-xl bg-card/50 border backdrop-blur-sm shadow-sm">
          <Tabs value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
            <TabsList className="bg-background/80">
              <TabsTrigger value="all" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-secondary data-[state=active]:text-white">All</TabsTrigger>
              <TabsTrigger value="tools" className="data-[state=active]:bg-primary data-[state=active]:text-white">Tools Only</TabsTrigger>
              <TabsTrigger value="ideas" className="data-[state=active]:bg-secondary data-[state=active]:text-white">Ideas Only</TabsTrigger>
            </TabsList>
          </Tabs>

          <Tabs value={timeFilter} onValueChange={(v) => setTimeFilter(v as typeof timeFilter)}>
            <TabsList className="bg-background/80">
              <TabsTrigger value="all">All Timeline</TabsTrigger>
              <TabsTrigger value="quick">Quick Wins</TabsTrigger>
              <TabsTrigger value="medium">Medium-Term</TabsTrigger>
              <TabsTrigger value="long">Long-Term</TabsTrigger>
            </TabsList>
          </Tabs>

          <Select value={sortBy} onValueChange={(v) => setSortBy(v as typeof sortBy)}>
            <SelectTrigger className="w-[180px] bg-background/80">
              <SelectValue placeholder="Sort by..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="category">By Category</SelectItem>
              <SelectItem value="cost">By Cost</SelectItem>
              <SelectItem value="date">By Date</SelectItem>
            </SelectContent>
          </Select>

          <Badge variant="secondary" className="ml-auto px-4 py-2 text-sm font-semibold">
            {filteredRecommendations.length} recommendations
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
        <div className="mt-16">
          <div className="flex items-center gap-3 mb-6 p-4 rounded-xl bg-gradient-to-r from-secondary/10 to-transparent border-l-4 border-secondary">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-secondary to-secondary/50 flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-white animate-pulse" />
            </div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-secondary to-secondary/70 bg-clip-text text-transparent">General Advice</h2>
          </div>
          <div className="space-y-5">
            {generalAdviceItems.map((item, index) => (
              <div
                key={index}
                className="group p-8 rounded-2xl border bg-gradient-to-br from-card to-card/50 shadow-elegant hover:shadow-glow transition-all duration-500 hover:-translate-y-1"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <p className="text-base leading-relaxed mb-5 text-foreground/90">{item.advice}</p>
                <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                  <Badge variant="outline" className="text-xs px-3 py-1 bg-background/50 group-hover:border-secondary/50 transition-colors">
                    {item.source.sourceIndustry}
                  </Badge>
                  <span className="text-muted-foreground/50">•</span>
                  <span className="px-3 py-1 rounded-md bg-background/30">{item.source.sourceTeamSize}</span>
                  <span className="text-muted-foreground/50">•</span>
                  <span className="px-3 py-1 rounded-md bg-background/30">{item.source.sourceBudget}</span>
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
