import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import GenomeCard from "@/components/genome/GenomeCard";
import CompetitorRadarChart from "@/components/genome/CompetitorRadarChart";
import CompetitorSWOT from "@/components/genome/CompetitorSWOT";
import PremiumLock from "@/components/genome/PremiumLock";
import BattleCardView from "@/components/genome/BattleCardView";
import WinLossChart from "@/components/genome/WinLossChart";
import DealForm from "@/components/genome/DealForm";
import DealHistoryTable from "@/components/genome/DealHistoryTable";
import { SEOHead } from "@/components/seo/SEOHead";
import { useAuth } from "@/contexts/AuthContext";
import { demoCompetitorAnalysis } from "@/lib/demo-competitor-data";
import { demoBattleCards } from "@/lib/demo-battlecard-data";
import { demoDeals } from "@/lib/demo-winloss-data";
import type { Deal } from "@/lib/demo-winloss-data";
import type { PerformanceScores } from "@/lib/demo-data";

const dimensions: Array<{ key: keyof PerformanceScores; label: string }> = [
  { key: "seo", label: "SEO" },
  { key: "content", label: "Content" },
  { key: "social", label: "Social" },
  { key: "paid", label: "Paid" },
  { key: "trust", label: "Trust" },
  { key: "funnel", label: "Funnel" },
];

const CompetitorAnalysis = () => {
  const { user, isPremium } = useAuth();
  const navigate = useNavigate();
  const [yourUrl, setYourUrl] = useState("");
  const [competitorUrls, setCompetitorUrls] = useState(["", "", ""]);
  const [showDemo, setShowDemo] = useState(false);
  const [deals, setDeals] = useState<Deal[]>(demoDeals);

  if (!user) {
    navigate("/auth");
    return null;
  }

  const updateCompetitor = (index: number, value: string) => {
    const updated = [...competitorUrls];
    updated[index] = value;
    setCompetitorUrls(updated);
  };

  const handleAnalyze = () => {
    if (!isPremium) return;
    console.log("Analyzing:", yourUrl, competitorUrls);
  };

  const handleAddDeal = (deal: Deal) => {
    setDeals((prev) => [deal, ...prev]);
  };

  const analysis = demoCompetitorAnalysis;
  const showReport = showDemo || false;
  const competitors = analysis.competitors.map((c) => c.name);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEOHead
        title="Competitor Analysis – Business Genome"
        description="Compare your business against competitors across 6 growth dimensions."
        canonical="/competitor-analysis"
      />
      <Navbar />

      <main className="flex-1">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 max-w-5xl">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-2">
              <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground">
                Competitor Analysis
              </h1>
              <Badge variant="outline" className="bg-primary/15 text-primary border-primary/30">
                Premium
              </Badge>
            </div>
             <p className="text-foreground/70">
               Compare your business against up to 3 competitors across 6 growth dimensions.
            </p>
          </div>

          {/* URL Input */}
          <Card className="border-border bg-card mb-6">
            <CardContent className="p-5 sm:p-6 space-y-4">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Your Website</p>
                <Input
                  type="url"
                  placeholder="https://your-website.com"
                  value={yourUrl}
                  onChange={(e) => setYourUrl(e.target.value)}
                  className="h-11 text-base bg-background border-border"
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Competitors (up to 3)</p>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={!yourUrl.trim()}
                    onClick={() => {
                      const { toast } = await import("@/hooks/use-toast");
                      toast({ title: "Coming soon", description: "AI competitor suggestions coming soon." });
                    }}
                    className="h-7 text-xs"
                  >
                    Suggest Competitors
                  </Button>
                </div>
                <div className="space-y-2">
                  {competitorUrls.map((url, i) => (
                    <Input
                      key={i}
                      type="url"
                      placeholder={`https://competitor-${i + 1}.com`}
                      value={url}
                      onChange={(e) => updateCompetitor(i, e.target.value)}
                      className="h-10 text-sm bg-background border-border"
                    />
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-3">
                {isPremium ? (
                  <Button onClick={handleAnalyze} disabled={!yourUrl.trim()}>
                    Analyze Competitors
                  </Button>
                ) : (
                  <div className="flex items-center gap-3">
                    <Button onClick={() => navigate("/pricing")}>
                      Upgrade to Premium
                    </Button>
                    <span className="text-base text-foreground/70">
                      Competitor Analysis is a Premium feature
                    </span>
                  </div>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowDemo(!showDemo)}
                >
                  {showDemo ? "Hide Demo" : "View Demo Report"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Demo Report */}
          {showReport && (
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                 <span className="text-base font-mono text-foreground/70">{analysis.yourDomain}</span>
                 <span className="text-foreground/70">vs</span>
                 {analysis.competitors.map((c) => (
                   <span key={c.name} className="text-base font-mono text-foreground/70">{c.domain}</span>
                 ))}
                 <Badge variant="outline" className="text-xs">Demo</Badge>
              </div>

              <CompetitorRadarChart
                yourName={analysis.yourName}
                yourScores={analysis.yourScores}
                competitors={analysis.competitors}
              />

              <GenomeCard title="Head-to-Head Comparison">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                         <th className="text-left py-3 px-4 text-xs uppercase tracking-wider text-muted-foreground">Dimension</th>
                         <th className="text-center py-3 px-4 text-xs uppercase tracking-wider text-primary">{analysis.yourName}</th>
                         {analysis.competitors.map((c) => (
                           <th key={c.name} className="text-center py-3 px-4 text-xs uppercase tracking-wider text-muted-foreground">{c.name}</th>
                         ))}
                      </tr>
                    </thead>
                    <tbody>
                      {dimensions.map((d) => {
                        const yourScore = analysis.yourScores[d.key];
                        const allScores = [yourScore, ...analysis.competitors.map((c) => c.scores[d.key])];
                        const maxScore = Math.max(...allScores);
                        return (
                          <tr key={d.key} className="border-b border-border/50">
                             <td className="py-3 px-4 text-base text-foreground">{d.label}</td>
                             <td className={`py-3 px-4 text-center text-base font-mono ${yourScore === maxScore ? "text-primary font-bold" : "text-foreground"}`}>
                              {yourScore}
                            </td>
                             {analysis.competitors.map((c) => (
                               <td key={c.name} className={`py-3 px-4 text-center text-base font-mono ${c.scores[d.key] === maxScore ? "text-primary font-bold" : "text-foreground/70"}`}>
                                {c.scores[d.key]}
                              </td>
                            ))}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </GenomeCard>

              <div>
                <h2 className="text-xl font-semibold text-foreground mb-4">SWOT Analysis</h2>
                <div className="grid grid-cols-1 gap-4">
                  {analysis.swotAnalyses.map((swot) => (
                    <CompetitorSWOT key={swot.competitor} swot={swot} />
                  ))}
                </div>
              </div>

              <GenomeCard title="Keyword Gaps">
                 <p className="text-sm text-foreground/70 mb-4 uppercase tracking-wide">
                  Keywords your competitors rank for that you don't
                </p>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                         <th className="text-left py-2 px-3 text-xs uppercase tracking-wider text-muted-foreground">Keyword</th>
                         <th className="text-left py-2 px-3 text-xs uppercase tracking-wider text-muted-foreground">Volume</th>
                         <th className="text-left py-2 px-3 text-xs uppercase tracking-wider text-muted-foreground">Competitors</th>
                         <th className="text-center py-2 px-3 text-xs uppercase tracking-wider text-muted-foreground">You</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analysis.keywordGaps.map((gap) => (
                        <tr key={gap.keyword} className="border-b border-border/50">
                           <td className="py-2 px-3 text-base font-mono text-foreground">{gap.keyword}</td>
                           <td className="py-2 px-3 text-base font-mono text-foreground/70">{gap.volume}</td>
                          <td className="py-2 px-3">
                            <div className="flex flex-wrap gap-1">
                              {gap.competitorHas.map((c) => (
                                <Badge key={c} variant="outline" className="text-xs">{c}</Badge>
                              ))}
                            </div>
                          </td>
                          <td className="py-2 px-3 text-center">
                            <span className={`text-base font-mono ${gap.youHave ? "text-primary" : "text-destructive"}`}>
                              {gap.youHave ? "Yes" : "No"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </GenomeCard>

              <GenomeCard title="Channel Gaps">
                 <p className="text-sm text-foreground/70 mb-4 uppercase tracking-wide">
                  Channels your competitors use that you're missing
                </p>
                <div className="space-y-3">
                  {analysis.channelGaps.map((gap) => (
                    <div key={gap.channel} className="border border-border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-base font-medium text-foreground">{gap.channel}</span>
                          {gap.youUsing ? (
                             <Badge variant="outline" className="text-xs bg-primary/15 text-primary border-primary/30">Active</Badge>
                           ) : (
                             <Badge variant="outline" className="text-xs bg-destructive/15 text-destructive border-destructive/30">Missing</Badge>
                           )}
                        </div>
                        <div className="flex gap-1">
                          {gap.competitorUsing.map((c) => (
                            <Badge key={c} variant="secondary" className="text-xs">{c}</Badge>
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-foreground/70 leading-relaxed border-l-2 border-primary/30 pl-3">
                        {gap.recommendation}
                      </p>
                    </div>
                  ))}
                </div>
              </GenomeCard>

              <GenomeCard title="Actionable Takeaways">
                <p className="text-sm text-foreground/70 mb-4 uppercase tracking-wide">
                  Concrete actions based on competitive gaps
                </p>
                <ol className="space-y-3">
                  {analysis.takeaways.map((takeaway, i) => (
                    <li key={i} className="flex items-start gap-3 text-base text-foreground leading-relaxed">
                      <span className="shrink-0 w-6 h-6 rounded-full bg-primary/15 text-primary text-xs font-bold flex items-center justify-center mt-0.5">
                        {i + 1}
                      </span>
                      {takeaway}
                    </li>
                  ))}
                </ol>
              </GenomeCard>

              {/* Battle Cards Section */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                   <h2 className="text-xl font-semibold text-foreground">Battle Cards</h2>
                   <Badge variant="outline" className="bg-primary/15 text-primary border-primary/30 text-xs">Premium</Badge>
                </div>
                <PremiumLock title="Unlock Battle Cards with Premium">
                  <BattleCardView cards={demoBattleCards} />
                </PremiumLock>
              </div>

              {/* Win/Loss Section */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                     <h2 className="text-xl font-semibold text-foreground">Win/Loss Tracking</h2>
                     <Badge variant="outline" className="bg-primary/15 text-primary border-primary/30 text-xs">Premium</Badge>
                  </div>
                  {isPremium && <DealForm competitors={competitors} onSubmit={handleAddDeal} />}
                </div>
                <PremiumLock title="Unlock Win/Loss Tracking with Premium">
                  <div className="space-y-4">
                    <WinLossChart deals={deals} />
                    <DealHistoryTable deals={deals} />
                  </div>
                </PremiumLock>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CompetitorAnalysis;
