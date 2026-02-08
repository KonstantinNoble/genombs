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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import GenomeCard from "@/components/genome/GenomeCard";
import TagList from "@/components/genome/TagList";
import { SEOHead } from "@/components/seo/SEOHead";
import { demoGenomes } from "@/lib/demo-data";

const GenomeView = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

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

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEOHead
        title={`${genome.companyName} – Business Genome`}
        description={`Market intelligence report for ${genome.domain}`}
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
                {genome.companyName}
              </h1>
              <p className="text-muted-foreground">{date}</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled>
                <Download className="w-4 h-4 mr-2" />
                PDF Export
              </Button>
              <Button size="sm" onClick={() => navigate("/dashboard")}>
                <Plus className="w-4 h-4 mr-2" />
                New Analysis
              </Button>
            </div>
          </div>

          {/* Genome Cards Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Business Model */}
            <GenomeCard title="Business Model" icon={Building2} className="lg:col-span-2">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-sm">
                    {genome.businessModel}
                  </Badge>
                  <Badge variant="outline" className="text-sm">
                    {genome.marketSegment}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {genome.businessModelDescription}
                </p>
              </div>
            </GenomeCard>

            {/* Offers */}
            <GenomeCard title="Offer Structure" icon={Package}>
              <div className="space-y-3">
                {genome.offers.map((offer) => (
                  <div
                    key={offer.name}
                    className="flex items-start justify-between p-3 rounded-lg bg-muted/50 border border-border"
                  >
                    <div>
                      <p className="text-sm font-medium text-foreground">{offer.name}</p>
                      <p className="text-xs text-muted-foreground">{offer.type}</p>
                    </div>
                    <span className="text-xs font-mono text-primary whitespace-nowrap ml-2">
                      {offer.priceSignal}
                    </span>
                  </div>
                ))}
              </div>
            </GenomeCard>

            {/* Audience Clusters */}
            <GenomeCard title="Audience Clusters" icon={Users}>
              <div className="space-y-4">
                {genome.audienceClusters.map((cluster) => (
                  <div key={cluster.name}>
                    <p className="text-sm font-medium text-foreground mb-1">{cluster.name}</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">{cluster.description}</p>
                  </div>
                ))}
              </div>
            </GenomeCard>

            {/* Funnel Analysis */}
            <GenomeCard title="Funnel Analysis" icon={GitFork}>
              <div className="space-y-3">
                <Badge variant="secondary" className="text-sm mb-2">
                  {genome.funnelType}
                </Badge>
                <ul className="space-y-2">
                  {genome.funnelElements.map((element, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <span className="w-5 h-5 rounded-full bg-primary/15 text-primary text-xs flex items-center justify-center shrink-0 mt-0.5 font-medium">
                        {i + 1}
                      </span>
                      {element}
                    </li>
                  ))}
                </ul>
              </div>
            </GenomeCard>

            {/* Messaging / USPs */}
            <GenomeCard title="Messaging & USPs" icon={MessageSquare}>
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

            {/* Channels */}
            <GenomeCard title="Channel Usage" icon={Megaphone}>
              <TagList tags={genome.channels} />
            </GenomeCard>

            {/* Content Formats */}
            <GenomeCard title="Content Formats" icon={FileText}>
              <TagList tags={genome.contentFormats} />
            </GenomeCard>

            {/* Trust Elements */}
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

            {/* Traffic Data */}
            <GenomeCard title="Traffic Data" icon={BarChart3} className="lg:col-span-2">
              {genome.trafficData ? (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  {/* Monthly Visits */}
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                      Monthly Visits
                    </p>
                    <p className="text-2xl font-bold text-foreground">{genome.trafficData.monthlyVisits}</p>
                  </div>

                  {/* Top Keywords */}
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">
                      Top Keywords
                    </p>
                    <TagList tags={genome.trafficData.topKeywords} variant="outline" />
                  </div>

                  {/* Traffic Sources */}
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">
                      Traffic Sources
                    </p>
                    <div className="space-y-2">
                      {genome.trafficData.trafficSources.map((s) => (
                        <div key={s.source} className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">{s.source}</span>
                          <span className="font-mono text-foreground">{s.percentage}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-sm text-muted-foreground">
                    Traffic data not available.{" "}
                    <span className="text-primary">Upgrade to Premium</span> for SimilarWeb integration.
                  </p>
                </div>
              )}
            </GenomeCard>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default GenomeView;
