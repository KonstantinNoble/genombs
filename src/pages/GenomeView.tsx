import { useParams, useNavigate, Link } from "react-router-dom";
import {
  Building2,
  Package,
  Users,
  GitFork,
  Megaphone,
  FileText,
  ShieldCheck,
  BarChart3,
  MessageSquare,
  ArrowLeft,
  Download,
  Plus,
  Globe,
  Sparkles,
  Lock,
  Lightbulb,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import GenomeCard from "@/components/genome/GenomeCard";
import TagList from "@/components/genome/TagList";
import GenomeScore from "@/components/genome/GenomeScore";
import StatCard from "@/components/genome/StatCard";
import SectionNav from "@/components/genome/SectionNav";
import RecommendationCard from "@/components/genome/RecommendationCard";
import ChannelStrengthBar from "@/components/genome/ChannelStrengthBar";
import CompetitorPreview from "@/components/genome/CompetitorPreview";
import KeyTakeaways from "@/components/genome/KeyTakeaways";
import { SEOHead } from "@/components/seo/SEOHead";
import { useAuth } from "@/contexts/AuthContext";
import { demoGenomes } from "@/lib/demo-data";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Cell,
  PieChart,
  Pie,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
} from "recharts";

const CHART_COLORS = [
  "hsl(25, 95%, 53%)",
  "hsl(30, 90%, 45%)",
  "hsl(20, 85%, 60%)",
  "hsl(35, 80%, 50%)",
  "hsl(15, 75%, 55%)",
  "hsl(0, 0%, 70%)",
];

const sections = [
  { id: "overview", label: "Overview" },
  { id: "business-model", label: "Market Position" },
  { id: "offers", label: "Offers" },
  { id: "audience", label: "Audience" },
  { id: "funnel", label: "Growth Strategy" },
  { id: "messaging", label: "Messaging" },
  { id: "channels", label: "Channels" },
  { id: "content", label: "Content" },
  { id: "trust", label: "Trust" },
  { id: "traffic", label: "Traffic" },
  { id: "insights", label: "Market Insights" },
];

const GenomeView = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isPremium } = useAuth();

  const genome = demoGenomes.find((g) => g.id === id);

  if (!genome) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <h1 className="text-2xl font-bold text-foreground">Genome not found</h1>
            <p className="text-muted-foreground">This analysis doesn't exist or has been deleted.</p>
            <Button variant="outline" onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const date = new Date(genome.createdAt).toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  const strengthLabel = (val: string) => {
    const map: Record<string, string> = { low: "Low", medium: "Medium", high: "High" };
    return map[val] || val;
  };

  const transparencyColor = (val: string) => {
    const map: Record<string, string> = {
      low: "bg-destructive/15 text-destructive border-destructive/30",
      medium: "bg-chart-3/15 text-chart-3 border-chart-3/30",
      high: "bg-primary/15 text-primary border-primary/30",
    };
    return map[val] || "";
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
       <SEOHead
        title={`Intelligence Report: ${genome.companyName} – Business Genome`}
        description={`Market intelligence report for ${genome.domain} — market position, strategy, and competitive analysis.`}
        canonical={`/genome/${genome.id}`}
      />
      <Navbar />

      <main className="flex-1">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 max-w-5xl">
          {/* Back Link */}
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Globe className="w-5 h-5 text-muted-foreground" />
                <span className="text-sm font-mono text-muted-foreground">{genome.domain}</span>
                <Badge variant="outline" className="bg-primary/15 text-primary border-primary/30">
                  Completed
                </Badge>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground mb-1">
                Intelligence Report: {genome.companyName}
              </h1>
              <p className="text-muted-foreground">Market position analysis for {genome.marketSegment} · {date}</p>
            </div>
            <div className="flex gap-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span>
                      <Button variant="outline" size="sm" disabled>
                        <Download className="w-4 h-4 mr-2" />
                        PDF Export
                      </Button>
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Coming soon — Premium feature</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <Button size="sm" onClick={() => navigate("/dashboard")}>
                <Plus className="w-4 h-4 mr-2" />
                New Research
              </Button>
            </div>
          </div>

          {/* Executive Summary */}
          <div id="overview" className="scroll-mt-24">
            <Card className="border-border bg-card mb-6">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row gap-6">
                  <div className="flex-1 space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="w-5 h-5 text-primary" />
                      <h2 className="text-lg font-semibold text-foreground">Executive Summary</h2>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {genome.executiveSummary}
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                      <div className="text-center p-3 rounded-lg bg-muted/50 border border-border">
                        <p className="text-xl font-bold text-foreground">{genome.offers.length}</p>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Offers</p>
                      </div>
                      <div className="text-center p-3 rounded-lg bg-muted/50 border border-border">
                        <p className="text-xl font-bold text-foreground">{genome.audienceClusters.length}</p>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Audiences</p>
                      </div>
                      <div className="text-center p-3 rounded-lg bg-muted/50 border border-border">
                        <p className="text-xl font-bold text-foreground">{genome.channels.length}</p>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Channels</p>
                      </div>
                      <div className="text-center p-3 rounded-lg bg-muted/50 border border-border">
                        <p className="text-xl font-bold text-foreground">{genome.trustElements.length}</p>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Trust Signals</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-center lg:border-l lg:border-border lg:pl-6">
                    <GenomeScore score={genome.genomeScore} size="lg" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Section Navigation */}
          <SectionNav sections={sections} />

          {/* Genome Cards Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Business Model / Market Position */}
            <div id="business-model" className="lg:col-span-2 scroll-mt-28">
              <GenomeCard title="How This Company Makes Money" icon={Building2} className="lg:col-span-2">
                <p className="text-xs text-muted-foreground mb-3 uppercase tracking-wide">Observed business model and revenue structure</p>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="secondary">{genome.businessModel}</Badge>
                    <Badge variant="outline">{genome.marketSegment}</Badge>
                    <Badge variant="outline">{genome.revenueModel}</Badge>
                    <Badge variant="outline" className={transparencyColor(genome.pricingTransparency)}>
                      Pricing: {strengthLabel(genome.pricingTransparency)}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {genome.businessModelDescription}
                  </p>
                </div>
              </GenomeCard>
            </div>

            {/* Offers */}
            <div id="offers" className="scroll-mt-28">
              <GenomeCard title="Products & Services Detected" icon={Package}>
                <p className="text-xs text-muted-foreground mb-3 uppercase tracking-wide">What this company sells and at what price points</p>
                <div className="space-y-0">
                  {/* Table header */}
                  <div className="grid grid-cols-12 gap-2 pb-2 border-b border-border text-[10px] uppercase tracking-wider text-muted-foreground">
                    <div className="col-span-4">Name</div>
                    <div className="col-span-3">Type</div>
                    <div className="col-span-3">Price Signal</div>
                    <div className="col-span-2">Tier</div>
                  </div>
                  {genome.offers.map((offer) => (
                    <div
                      key={offer.name}
                      className="grid grid-cols-12 gap-2 py-3 border-b border-border/50 items-center"
                    >
                      <div className="col-span-4 text-sm font-medium text-foreground">{offer.name}</div>
                      <div className="col-span-3 text-xs text-muted-foreground">{offer.type}</div>
                      <div className="col-span-3 text-xs font-mono text-primary">{offer.priceSignal}</div>
                      <div className="col-span-2">
                        {offer.tier && (
                          <Badge variant="outline" className="text-[10px]">{offer.tier}</Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </GenomeCard>
            </div>

            {/* Audience Clusters */}
            <div id="audience" className="scroll-mt-28">
              <GenomeCard title="Who They Target" icon={Users}>
                <p className="text-xs text-muted-foreground mb-3 uppercase tracking-wide">Identified target audiences based on messaging and content analysis</p>
                <div className="space-y-4">
                  {genome.audienceClusters.map((cluster) => (
                    <div key={cluster.name} className="p-3 rounded-lg bg-muted/50 border border-border">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-medium text-foreground">{cluster.name}</p>
                        <div className="flex items-center gap-1.5">
                          <Badge variant="outline" className="text-[10px]">
                            {cluster.size}
                          </Badge>
                          <Badge
                            variant="outline"
                            className={
                              cluster.priority === "primary"
                                ? "bg-primary/15 text-primary border-primary/30 text-[10px]"
                                : "text-[10px]"
                            }
                          >
                            {cluster.priority}
                          </Badge>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">{cluster.description}</p>
                    </div>
                  ))}
                </div>
              </GenomeCard>
            </div>

            {/* Funnel Analysis */}
            <div id="funnel" className="scroll-mt-28">
              <GenomeCard title="Their Growth Playbook" icon={GitFork}>
                <p className="text-xs text-muted-foreground mb-3 uppercase tracking-wide">How this company acquires and converts customers</p>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary">{genome.funnelType}</Badge>
                    <span className="text-xs text-muted-foreground">
                      Completeness: {genome.funnelElements.length}/{genome.funnelElements.length > 4 ? 5 : genome.funnelElements.length + 1} stages
                    </span>
                  </div>
                  <div className="space-y-0">
                    {genome.funnelElements.map((element, i) => (
                      <div key={i} className="flex items-stretch gap-3">
                        {/* Vertical connector */}
                        <div className="flex flex-col items-center">
                          <span className="w-7 h-7 rounded-full bg-primary/15 text-primary text-xs flex items-center justify-center shrink-0 font-medium border border-primary/30">
                            {i + 1}
                          </span>
                          {i < genome.funnelElements.length - 1 && (
                            <div className="w-px flex-1 bg-border my-1" />
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground py-1.5">{element}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </GenomeCard>
            </div>

            {/* Messaging / USPs */}
            <div id="messaging" className="scroll-mt-28">
              <GenomeCard title="Their Positioning & Value Props" icon={MessageSquare}>
                <p className="text-xs text-muted-foreground mb-3 uppercase tracking-wide">Key messages and unique selling propositions detected</p>
                <div className="space-y-3">
                  {genome.messagingPatterns.map((pattern, i) => (
                    <div
                      key={i}
                      className="p-3 rounded-lg bg-muted/50 border border-border"
                    >
                      <p className="text-sm font-medium text-foreground mb-1">
                        "{pattern.usp}"
                      </p>
                      <p className="text-xs text-muted-foreground">Tone: {pattern.tone}</p>
                    </div>
                  ))}
                </div>
              </GenomeCard>
            </div>

            {/* Channels */}
            <div id="channels" className="scroll-mt-28">
              <GenomeCard title="Where They Reach Their Audience" icon={Megaphone}>
                <p className="text-xs text-muted-foreground mb-3 uppercase tracking-wide">Distribution channels and their relative strength</p>
                <ChannelStrengthBar channels={genome.channelStrengths} />
              </GenomeCard>
            </div>

            {/* Content Formats */}
            <div id="content" className="scroll-mt-28">
              <GenomeCard title="Content Formats" icon={FileText}>
                <TagList tags={genome.contentFormats} />
              </GenomeCard>
            </div>

            {/* Trust Elements */}
            <div id="trust" className="scroll-mt-28">
              <GenomeCard title="Trust Elements" icon={ShieldCheck}>
                <ul className="space-y-2">
                  {genome.trustElements.map((el, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <ShieldCheck className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                      {el}
                    </li>
                  ))}
                </ul>
              </GenomeCard>
            </div>

            {/* Traffic Data */}
            <div id="traffic" className="lg:col-span-2 scroll-mt-28">
              <GenomeCard title="Traffic Data" icon={BarChart3} className="lg:col-span-2">
                {genome.trafficData ? (
                  <div className="space-y-6">
                    {/* Monthly Visits */}
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                        Monthly Visits
                      </p>
                      <p className="text-3xl font-bold text-foreground">{genome.trafficData.monthlyVisits}</p>
                    </div>

                    {/* Charts */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Bar Chart - Traffic Sources */}
                      <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wide mb-3">
                          Traffic Sources
                        </p>
                        <ResponsiveContainer width="100%" height={200}>
                          <BarChart data={genome.trafficData.trafficSources} layout="vertical">
                            <XAxis type="number" domain={[0, 100]} tick={{ fill: "hsl(0, 0%, 85%)", fontSize: 11 }} tickLine={false} axisLine={false} />
                            <YAxis type="category" dataKey="source" width={100} tick={{ fill: "hsl(0, 0%, 85%)", fontSize: 11 }} tickLine={false} axisLine={false} />
                            <RechartsTooltip
                              contentStyle={{ background: "hsl(0, 0%, 8%)", border: "1px solid hsl(0, 0%, 15%)", borderRadius: 8, color: "hsl(0, 0%, 98%)" }}
                              formatter={(value: number) => [`${value}%`, "Share"]}
                            />
                            <Bar dataKey="percentage" radius={[0, 4, 4, 0]}>
                              {genome.trafficData.trafficSources.map((_, index) => (
                                <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </div>

                      {/* Donut Chart */}
                      <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wide mb-3">
                          Traffic Distribution
                        </p>
                        <ResponsiveContainer width="100%" height={200}>
                          <PieChart>
                            <Pie
                              data={genome.trafficData.trafficSources}
                              dataKey="percentage"
                              nameKey="source"
                              cx="50%"
                              cy="50%"
                              innerRadius={50}
                              outerRadius={80}
                              paddingAngle={2}
                            >
                              {genome.trafficData.trafficSources.map((_, index) => (
                                <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                              ))}
                            </Pie>
                            <RechartsTooltip
                              contentStyle={{ background: "hsl(0, 0%, 8%)", border: "1px solid hsl(0, 0%, 15%)", borderRadius: 8, color: "hsl(0, 0%, 98%)" }}
                              formatter={(value: number) => [`${value}%`, "Share"]}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* Top Keywords */}
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">
                        Top Keywords
                      </p>
                      <TagList tags={genome.trafficData.topKeywords} variant="outline" />
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 space-y-3">
                    <Lock className="w-8 h-8 text-muted-foreground mx-auto" />
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Traffic data not available for free accounts.
                      </p>
                      <button
                        onClick={() => navigate("/pricing")}
                        className="text-sm text-primary hover:underline font-medium mt-1"
                      >
                        Upgrade to Premium for SimilarWeb integration →
                      </button>
                    </div>
                  </div>
                )}
              </GenomeCard>
            </div>

            {/* Market Insights */}
            <div id="insights" className="lg:col-span-2 scroll-mt-28">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  <h2 className="text-lg font-semibold text-foreground">Market Insights</h2>
                </div>
                <p className="text-sm text-muted-foreground">
                  Key observations and patterns detected in this market segment.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {genome.recommendations.map((rec, i) => (
                    <RecommendationCard
                      key={i}
                      recommendation={rec}
                      isPremium={isPremium}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Key Takeaways */}
            <div className="lg:col-span-2">
              <KeyTakeaways takeaways={genome.keyTakeaways} />
            </div>

            {/* Market Landscape */}
            <div className="lg:col-span-2">
              <CompetitorPreview
                competitors={genome.competitors}
                isPremium={isPremium}
              />
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default GenomeView;
