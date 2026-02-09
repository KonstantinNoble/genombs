import { useParams, useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import GenomeCard from "@/components/genome/GenomeCard";
import GenomeScore from "@/components/genome/GenomeScore";
import SectionNav from "@/components/genome/SectionNav";
import ICPCard from "@/components/genome/ICPCard";
import AudienceChannelCard from "@/components/genome/AudienceChannelCard";
import OptimizationCard from "@/components/genome/OptimizationCard";
import PerformanceChart from "@/components/genome/PerformanceChart";
import PremiumLock from "@/components/genome/PremiumLock";
import { SEOHead } from "@/components/seo/SEOHead";
import { useAuth } from "@/contexts/AuthContext";
import { demoReports } from "@/lib/demo-data";

const sections = [
  { id: "overview", label: "Overview" },
  { id: "performance", label: "Performance" },
  { id: "icp", label: "ICP" },
  { id: "audience-channels", label: "Channels" },
  { id: "optimization", label: "Optimization" },
];

const GenomeView = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isPremium } = useAuth();

  const report = demoReports.find((r) => r.id === id);

  if (!report) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <h1 className="text-2xl font-bold text-foreground">Report not found</h1>
            <p className="text-muted-foreground">This report doesn't exist or has been deleted.</p>
            <Button variant="outline" onClick={() => navigate("/dashboard")}>
              Back to Dashboard
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const date = new Date(report.createdAt).toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEOHead
        title={`Growth Report: ${report.companyName} – Business Genome`}
        description={`Growth report for ${report.domain} — ICP, audience channels, optimization, and growth strategies.`}
        canonical={`/genome/${report.id}`}
      />
      <Navbar />

      <main className="flex-1">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 max-w-5xl">
          {/* Back Link */}
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
          >
            ← Back to Dashboard
          </Link>

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-mono text-muted-foreground">{report.domain}</span>
                <Badge variant="outline" className="bg-primary/15 text-primary border-primary/30">
                  Completed
                </Badge>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground mb-1">
                Growth Report: {report.companyName}
              </h1>
              <p className="text-foreground/70">{report.segment} · {date}</p>
            </div>
            <div className="flex gap-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span>
                      <Button variant="outline" size="sm" disabled>
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
                New Scan
              </Button>
            </div>
          </div>

          {/* Executive Summary */}
          <div id="overview" className="scroll-mt-24">
            <Card className="border-border bg-card mb-6">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row gap-6">
                  <div className="flex-1 space-y-4">
                     <h2 className="text-xl font-semibold text-foreground">Executive Summary</h2>
                     <p className="text-base text-foreground/70 leading-relaxed">
                      {report.summary}
                    </p>
                    {/* Top 3 Priorities */}
                    <div className="pt-2">
                       <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">
                        Top Priorities
                      </p>
                      <ol className="space-y-2">
                        {report.topPriorities.map((priority, i) => (
                          <li key={i} className="flex items-start gap-3 text-base text-foreground">
                            <span className="shrink-0 w-5 h-5 rounded-full bg-primary/15 text-primary text-xs font-bold flex items-center justify-center mt-0.5">
                              {i + 1}
                            </span>
                            <span className="leading-relaxed">{priority}</span>
                          </li>
                        ))}
                      </ol>
                    </div>
                  </div>
                  <div className="flex items-center justify-center lg:border-l lg:border-border lg:pl-6">
                    <GenomeScore score={report.growthScore} size="lg" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Section Navigation */}
          <SectionNav sections={sections} />

          {/* Cards Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Business Snapshot */}
            <div className="lg:col-span-2">
              <GenomeCard title="Business Snapshot">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="secondary">{report.businessModel.type}</Badge>
                    <Badge variant="outline">{report.segment}</Badge>
                    <Badge variant="outline">{report.businessModel.revenueModel}</Badge>
                    <Badge variant="outline" className="bg-primary/15 text-primary border-primary/30">
                      {report.businessModel.growthLever}
                    </Badge>
                  </div>
                  <p className="text-base text-foreground/70 leading-relaxed">
                    {report.businessModel.description}
                  </p>
                  {/* Positioning + Differentiators — free for all */}
                  <div className="space-y-4">
                    <div>
                       <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Positioning</p>
                       <p className="text-base text-foreground leading-relaxed border-l-2 border-primary/30 pl-3">
                        {report.businessModel.positioning}
                      </p>
                    </div>
                    <div>
                       <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Key Differentiators</p>
                       <ul className="space-y-1.5">
                         {report.businessModel.differentiators.map((d, i) => (
                           <li key={i} className="flex items-start gap-2 text-base text-foreground/70 leading-relaxed">
                            <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0 mt-2" />
                            {d}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </GenomeCard>
            </div>

            {/* Performance Chart */}
            <div id="performance" className="lg:col-span-2 scroll-mt-28">
              <GenomeCard title="Performance Overview">
                 <p className="text-sm text-foreground/70 mb-4 uppercase tracking-wide">
                  Growth performance across 6 dimensions vs industry average
                </p>
                <PerformanceChart
                  scores={report.performanceScores}
                  industryAverage={report.industryAverage}
                  companyName={report.companyName}
                  scoreInsights={report.scoreInsights}
                  industryBenchmarks={report.industryBenchmarks}
                />
              </GenomeCard>
            </div>

            {/* ICP */}
            <div id="icp" className="lg:col-span-2 scroll-mt-28">
              <GenomeCard title="Ideal Customer Profile (ICP)">
                 <p className="text-sm text-foreground/70 mb-4 uppercase tracking-wide">
                  Identified target audiences with buying triggers, objections, and where to find them
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {report.icp.map((persona, i) => (
                    <ICPCard key={persona.name} persona={persona} index={i} isPremium={isPremium} />
                  ))}
                </div>
              </GenomeCard>
            </div>

            {/* Audience Channels */}
            <div id="audience-channels" className="lg:col-span-2 scroll-mt-28">
              <GenomeCard title="Where Your Audience Lives">
                <p className="text-sm text-foreground/70 mb-4 uppercase tracking-wide">
                  Organic and paid channels, SEO keywords, and targeting strategies
                </p>
                <AudienceChannelCard
                  channels={report.audienceChannels}
                  seoKeywords={report.seoKeywords}
                  seoScore={report.seoScore}
                  seoRecommendation={report.seoRecommendation}
                  paidCompetitionLevel={report.paidCompetitionLevel}
                  estimatedCPC={report.estimatedCPC}
                  isPremium={isPremium}
                />
              </GenomeCard>
            </div>

            {/* Optimization */}
            <div id="optimization" className="lg:col-span-2 scroll-mt-28">
              <div className="space-y-4">
                <div>
                   <h2 className="text-xl font-semibold text-foreground">Website Optimization</h2>
                   <p className="text-base text-foreground/70 mt-1">
                     Concrete improvements with estimated effort and expected outcomes.
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {report.optimizations.map((opt, i) => (
                    <OptimizationCard key={i} optimization={opt} isPremium={isPremium} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default GenomeView;
