import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export interface StructuredMarketData {
  marketSize?: string;
  growthRate?: string;
  topCompetitors?: { name: string; marketShare?: string; keyStrength?: string }[];
  averageCAC?: string;
  conversionRateBenchmark?: string;
  bestChannels?: { channel: string; roi?: string }[];
  keyTrends?: string[];
  rawInsights?: string;
}

interface MarketIntelligenceCardProps {
  data: StructuredMarketData;
  sources?: string[];
}

export function MarketIntelligenceCard({ data, sources }: MarketIntelligenceCardProps) {
  const hasData = data.marketSize || data.growthRate || 
    (data.topCompetitors && data.topCompetitors.length > 0) ||
    data.averageCAC || data.conversionRateBenchmark ||
    (data.bestChannels && data.bestChannels.length > 0) ||
    (data.keyTrends && data.keyTrends.length > 0);

  if (!hasData) {
    return null;
  }

  return (
    <Card className="bg-gradient-to-br from-cyan-500/10 via-blue-500/5 to-purple-500/10 border-cyan-500/30 overflow-hidden">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-lg">Market Intelligence</h3>
            <p className="text-xs text-muted-foreground">Powered by Perplexity AI Research</p>
          </div>
          <Badge className="bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 border-cyan-500/30">
            LIVE DATA
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-5">
        {/* Market Size & Growth */}
        {(data.marketSize || data.growthRate) && (
          <div className="grid grid-cols-2 gap-4">
            {data.marketSize && (
              <div className="bg-background/50 rounded-lg p-4 border border-border/50">
                <span className="text-xs uppercase font-medium text-muted-foreground">Market Size</span>
                <p className="text-xl font-bold text-foreground">{data.marketSize}</p>
              </div>
            )}
            {data.growthRate && (
              <div className="bg-background/50 rounded-lg p-4 border border-border/50">
                <span className="text-xs uppercase font-medium text-muted-foreground">Growth Rate</span>
                <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">{data.growthRate}</p>
              </div>
            )}
          </div>
        )}

        {/* Benchmarks */}
        {(data.averageCAC || data.conversionRateBenchmark) && (
          <div className="grid grid-cols-2 gap-4">
            {data.averageCAC && (
              <div className="bg-background/50 rounded-lg p-4 border border-border/50">
                <span className="text-xs uppercase font-medium text-muted-foreground">Avg. CAC</span>
                <p className="text-lg font-semibold text-foreground">{data.averageCAC}</p>
              </div>
            )}
            {data.conversionRateBenchmark && (
              <div className="bg-background/50 rounded-lg p-4 border border-border/50">
                <span className="text-xs uppercase font-medium text-muted-foreground">Conversion Rate</span>
                <p className="text-lg font-semibold text-foreground">{data.conversionRateBenchmark}</p>
              </div>
            )}
          </div>
        )}

        {/* Top Competitors */}
        {data.topCompetitors && data.topCompetitors.length > 0 && (
          <div>
            <span className="text-xs uppercase font-medium text-muted-foreground mb-3 block">Top Competitors</span>
            <div className="flex flex-wrap gap-2">
              {data.topCompetitors.map((comp, i) => (
                <div key={i} className="bg-background/50 rounded-lg px-3 py-2 border border-border/50 text-sm">
                  <span className="font-medium">{comp.name}</span>
                  {comp.marketShare && (
                    <span className="text-muted-foreground ml-2">({comp.marketShare})</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Best Channels */}
        {data.bestChannels && data.bestChannels.length > 0 && (
          <div>
            <span className="text-xs uppercase font-medium text-muted-foreground mb-3 block">Best Performing Channels</span>
            <div className="flex flex-wrap gap-2">
              {data.bestChannels.map((ch, i) => (
                <Badge key={i} variant="secondary" className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20">
                  {ch.channel}
                  {ch.roi && <span className="ml-1 opacity-75">({ch.roi})</span>}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Key Trends */}
        {data.keyTrends && data.keyTrends.length > 0 && (
          <div>
            <span className="text-xs uppercase font-medium text-muted-foreground mb-3 block">Key Market Trends</span>
            <ul className="space-y-2">
              {data.keyTrends.map((trend, i) => (
                <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                  <span className="text-cyan-500 mt-1">-</span>
                  <span>{trend}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Sources */}
        {sources && sources.length > 0 && (
          <div className="pt-3 border-t border-border/50">
            <p className="text-xs text-muted-foreground mb-2">Sources:</p>
            <div className="flex flex-wrap gap-2">
              {sources.slice(0, 5).map((source, i) => {
                let displayName = source;
                try {
                  displayName = new URL(source).hostname.replace('www.', '');
                } catch {}
                return (
                  <a
                    key={i}
                    href={source}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-cyan-600 dark:text-cyan-400 hover:underline"
                  >
                    {displayName}
                  </a>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
