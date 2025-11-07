import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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

      {/* General Advice Section */}
      {generalAdviceItems.length > 0 && (
        <div className="mt-12">
          <h2 className="text-2xl font-semibold mb-4">General Advice</h2>
          <div className="space-y-4">
            {generalAdviceItems.map((item, index) => (
              <div
                key={index}
                className="p-6 rounded-lg border bg-card hover:shadow-md transition-shadow"
              >
                <p className="text-sm leading-relaxed mb-3">{item.advice}</p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Badge variant="outline" className="text-xs">
                    {item.source.sourceIndustry}
                  </Badge>
                  <span>•</span>
                  <span>{item.source.sourceTeamSize}</span>
                  <span>•</span>
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
