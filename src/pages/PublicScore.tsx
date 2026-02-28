import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/external-client";
import { SEOHead } from "@/components/seo/SEOHead";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, ExternalLink, ArrowRight } from "lucide-react";
import { Helmet } from "react-helmet-async";
import type { WebsiteProfile } from "@/types/chat";

const ScoreRing = ({ score, size = 96 }: { score: number; size?: number }) => {
  const radius = (size - 10) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color =
    score >= 80 ? "hsl(var(--chart-6))" : score >= 60 ? "hsl(var(--primary))" : "hsl(var(--destructive))";

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="hsl(var(--border))" strokeWidth={5} />
        <circle
          cx={size / 2} cy={size / 2} r={radius} fill="none"
          stroke={color} strokeWidth={5}
          strokeDasharray={circumference} strokeDashoffset={offset}
          strokeLinecap="round" className="transition-all duration-1000 ease-out"
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-2xl font-bold text-foreground">
        {score}
      </span>
    </div>
  );
};

const CategoryBar = ({ label, value }: { label: string; value: number }) => {
  const color = value >= 80 ? "bg-chart-6" : value >= 60 ? "bg-primary" : "bg-destructive";
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-muted-foreground w-24 shrink-0">{label}</span>
      <div className="flex-1 h-2.5 rounded-full bg-secondary overflow-hidden">
        <div className={`h-full rounded-full ${color} transition-all duration-1000 ease-out`} style={{ width: `${value}%` }} />
      </div>
      <span className="text-sm font-semibold text-foreground w-8 text-right">{value}</span>
    </div>
  );
};

const PublicScore = () => {
  const { slug } = useParams<{ slug: string }>();
  const [profile, setProfile] = useState<WebsiteProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) return;
    const fetchProfile = async () => {
      const { data, error } = await supabase
        .from("website_profiles")
        .select("id, url, overall_score, category_scores, profile_data, is_own_website, user_id, conversation_id, status, created_at, public_slug, is_public, published_at")
        .eq("public_slug", slug)
        .eq("is_public", true)
        .single();

      if (error || !data) {
        setNotFound(true);
      } else {
        setProfile(data as unknown as WebsiteProfile);
      }
      setLoading(false);
    };
    fetchProfile();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (notFound || !profile || !profile.profile_data || !profile.category_scores || profile.overall_score == null) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4">
        <SEOHead title="Score Not Found" description="This public score page does not exist." noindex />
        <h1 className="text-2xl font-bold text-foreground">Score Not Found</h1>
        <p className="text-muted-foreground">This report is not available or has been unpublished.</p>
        <Button asChild>
          <Link to="/chat">Analyze Your Website <ArrowRight className="ml-2 w-4 h-4" /></Link>
        </Button>
      </div>
    );
  }

  const { profile_data, category_scores, overall_score, url } = profile;
  const siteName = profile_data.name || url;
  const pageTitle = `${siteName} – Website Score ${overall_score}/100`;
  const pageDescription = `${siteName} scored ${overall_score}/100 in the Synvertas website analysis. See the full breakdown across findability, mobile, offer clarity, trust, and conversion readiness.`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: pageTitle,
    description: pageDescription,
    url: `https://synvertas.com/scores/${slug}`,
    publisher: {
      "@type": "Organization",
      name: "Synvertas",
      url: "https://synvertas.com",
    },
    mainEntity: {
      "@type": "Rating",
      ratingValue: overall_score,
      bestRating: 100,
      worstRating: 0,
      author: { "@type": "Organization", name: "Synvertas" },
    },
  };

  return (
    <main className="min-h-screen py-12 px-4">
      <SEOHead
        title={pageTitle}
        description={pageDescription}
        canonical={`/scores/${slug}`}
        keywords="website score, website analysis, site audit, website performance"
      />
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>

      <div className="max-w-2xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <ScoreRing score={overall_score} size={120} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">{siteName}</h1>
            <a
              href={url.startsWith("http") ? url : `https://${url}`}
              target="_blank"
              rel="noopener"
              className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline mt-1"
            >
              {url} <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
          <Badge variant="outline" className="text-xs">
            Analyzed by Synvertas
          </Badge>
        </div>

        {/* Category Scores */}
        <Card className="border-border bg-card">
          <CardContent className="p-6 space-y-3">
            <h2 className="text-lg font-semibold text-foreground mb-4">Category Breakdown</h2>
            <CategoryBar label="Findability" value={category_scores.findability} />
            <CategoryBar label="Mobile" value={category_scores.mobileUsability} />
            <CategoryBar label="Offer Clarity" value={category_scores.offerClarity} />
            <CategoryBar label="Trust" value={category_scores.trustProof} />
            <CategoryBar label="Conversion" value={category_scores.conversionReadiness} />
          </CardContent>
        </Card>

        {/* Strengths only – weaknesses are private */}
        {profile_data.strengths && profile_data.strengths.length > 0 && (
          <Card className="border-border bg-card">
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-chart-6" /> Key Strengths
              </h2>
              <ul className="space-y-2">
                {profile_data.strengths.map((s) => (
                  <li key={s} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 mt-2 rounded-full bg-chart-6 shrink-0" />
                    <span className="text-sm text-foreground">{s}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* CTA */}
        <div className="text-center space-y-3 pt-4">
          <p className="text-muted-foreground text-sm">Want to know your website's score?</p>
          <Button asChild size="lg">
            <Link to="/chat">
              Analyze Your Website <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
          </Button>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground pt-8">
          Powered by <Link to="/" className="text-primary hover:underline">Synvertas</Link>
        </p>
      </div>
    </main>
  );
};

export default PublicScore;
