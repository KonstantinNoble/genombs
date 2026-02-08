import { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/lib/supabase/external-client";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { SEOHead } from "@/components/seo/SEOHead";
import { WebPageSchema, OrganizationSchema } from "@/components/seo/StructuredData";
import { useAuth } from "@/contexts/AuthContext";
import FAQSection from "@/components/genome/FAQSection";
import {
  ArrowRight,
  Globe,
  Target,
  Lightbulb,
  Search,
  Cpu,
  FileText,
  Users,
  TrendingUp,
  Crosshair,
  PenTool,
  Check,
  X,
  Minus,
  Quote,
  BarChart3,
  Zap,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const Home = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isLoggedIn = !!user;

  useEffect(() => {
    const handleEmailVerification = async () => {
      if (window.location.hash) {
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const type = hashParams.get("type");

        if (type === "signup") {
          const {
            data: { session },
          } = await supabase.auth.getSession();

          if (session?.user) {
            const { data: profile } = await supabase
              .from("profiles")
              .select("id")
              .eq("id", session.user.id)
              .single();

            if (!profile) {
              await supabase.from("profiles").insert({
                id: session.user.id,
              });

              await supabase.from("user_credits").insert({
                user_id: session.user.id,
              });
            }

            toast({
              title: "Email verified!",
              description: "Your account has been activated. Welcome!",
            });
            window.history.replaceState({}, document.title, window.location.pathname);
          }
        }
      }
    };

    handleEmailVerification();
  }, [toast, navigate]);

  const features = [
    {
      icon: Globe,
      title: "Domain Intelligence",
      description:
        "Automatically detect business models, offer structures, pricing signals, and funnel types from any website.",
    },
    {
      icon: Target,
      title: "Market Positioning",
      description:
        "Understand audience clusters, competitive positioning, and market segments at a glance.",
    },
    {
      icon: Lightbulb,
      title: "Actionable Insights",
      description:
        "Get concrete recommendations for content strategy, channel usage, and messaging improvements.",
    },
  ];

  const steps = [
    {
      icon: Search,
      step: "01",
      title: "Enter a URL",
      description: "Paste any company website to start the analysis.",
    },
    {
      icon: Cpu,
      step: "02",
      title: "AI analyzes the site",
      description: "Our engine crawls, extracts, and structures the business data.",
    },
    {
      icon: FileText,
      step: "03",
      title: "Get your Business Genome",
      description: "Receive a structured intelligence report you can act on.",
    },
  ];

  const useCases = [
    {
      icon: Crosshair,
      title: "Competitor Research",
      description: "Analyze competitor websites in seconds. Understand their positioning, funnel strategy, and channel usage.",
      badge: "Most Popular",
    },
    {
      icon: TrendingUp,
      title: "Market Entry",
      description: "Understand a new market before entering. Decode the playbooks of established players.",
      badge: "Strategic",
    },
    {
      icon: Users,
      title: "Sales Intelligence",
      description: "Qualify leads by analyzing their website. Know their business model and pain points before the first call.",
      badge: "Revenue",
    },
    {
      icon: PenTool,
      title: "Content Strategy",
      description: "Find content gaps in your market. Understand what formats and channels your competitors use.",
      badge: "Growth",
    },
  ];

  const comparisonRows = [
    { feature: "Analysis Speed", genome: "< 60 seconds", traditional: "Hours to days" },
    { feature: "Data Depth", genome: "9 structured sections", traditional: "Surface-level overview" },
    { feature: "Cost per Analysis", genome: "Free / $26.99/mo unlimited", traditional: "$500+ per report" },
    { feature: "Automation", genome: true, traditional: false },
    { feature: "Structured Output", genome: true, traditional: "partial" },
    { feature: "Real-time Data", genome: true, traditional: false },
  ];

  const testimonials = [
    {
      quote: "Business Genome saved me hours of manual competitor research. I can now analyze any company in under a minute.",
      name: "Sarah K.",
      role: "Product Manager",
      company: "TechVentures Inc.",
    },
    {
      quote: "The structured output is incredibly useful for sales prep. I know exactly what a prospect's business model looks like before the call.",
      name: "Marcus L.",
      role: "Account Executive",
      company: "GrowthStack",
    },
    {
      quote: "We use Business Genome for every market entry analysis. The funnel and channel insights are spot on.",
      name: "Dr. Elena M.",
      role: "Strategy Lead",
      company: "Innovate Partners",
    },
  ];

  const homeFAQ = [
    {
      question: "What is a Business Genome?",
      answer: "A Business Genome is a structured intelligence report generated from any website. It decodes the company's business model, offer structure, audience clusters, funnel strategy, channel usage, messaging patterns, trust elements, and traffic data into a standardized, actionable format.",
    },
    {
      question: "How accurate is the analysis?",
      answer: "Our AI engine combines web crawling, content extraction, and large language model analysis to achieve high accuracy. The system is designed to surface verifiable data points and clearly label inferences. Traffic data comes from SimilarWeb for premium users.",
    },
    {
      question: "What data sources do you use?",
      answer: "We crawl the target website's publicly available pages, extract structured data, and analyze content patterns using AI. For premium users, we also integrate SimilarWeb traffic data for visitor estimates, keywords, and traffic source breakdowns.",
    },
    {
      question: "How long does an analysis take?",
      answer: "Most analyses complete in under 60 seconds. Complex websites with many pages may take slightly longer. You'll see a real-time status update while the analysis is running.",
    },
    {
      question: "Can I export reports?",
      answer: "Yes — premium users can export any Business Genome as a professionally formatted PDF report. This is useful for sharing with team members, clients, or stakeholders.",
    },
    {
      question: "Is my data secure?",
      answer: "Absolutely. We only analyze publicly available website data. Your account data is encrypted and stored securely. We are GDPR compliant and do not sell or share your analysis data with third parties.",
    },
  ];

  const stats = [
    { value: "500+", label: "Businesses Analyzed", icon: BarChart3 },
    { value: "12", label: "Market Segments", icon: Target },
    { value: "<60s", label: "Per Analysis", icon: Clock },
    { value: "9", label: "Intelligence Sections", icon: Zap },
  ];

  return (
    <div className="min-h-screen relative overflow-hidden flex flex-col">
      <SEOHead
        title="Business Genome – Market Intelligence from a single URL"
        description="Turn any website into a structured market intelligence report. Understand business models, audiences, funnels, and competitive positioning instantly."
        keywords="market intelligence, business analysis, competitor analysis, SaaS analytics, business genome"
        canonical="/"
        ogImage="https://synoptas.com/synoptas-favicon.png"
      />
      <OrganizationSchema
        name="Synoptas"
        url="https://synoptas.com"
        logo="https://synoptas.com/synoptas-favicon.png"
        description="Business Genome – Market Intelligence Platform"
      />
      <WebPageSchema
        name="Business Genome – Market Intelligence from a single URL"
        description="Turn any website into a structured market intelligence report."
        url="https://synoptas.com/"
      />
      <Navbar />

      {/* Hero Section */}
      <section className="flex-1 flex items-center justify-center py-20 sm:py-28">
        <div className="container mx-auto px-4 text-center space-y-8 max-w-3xl">
          <Badge variant="outline" className="mb-2 text-sm">
            Market Intelligence Platform
          </Badge>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-foreground leading-tight">
            Understand any business{" "}
            <span className="text-primary">from a single URL</span>
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
            Turn any website into a structured market intelligence report. Decode business models,
            audiences, funnels, and competitive positioning — instantly.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button size="lg" asChild className="text-base px-8 h-13">
              <Link to={isLoggedIn ? "/dashboard" : "/auth"}>
                Start Analyzing
                <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="text-base px-8 h-13">
              <Link to="/pricing">View Pricing</Link>
            </Button>
          </div>

          {/* Mini-preview of genome */}
          <div className="pt-8 max-w-2xl mx-auto">
            <Card className="border-border bg-card text-left">
              <CardContent className="p-5 sm:p-6">
                <div className="flex items-center gap-2 mb-3">
                  <Globe className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-mono text-muted-foreground">stripe.com</span>
                  <Badge variant="outline" className="bg-primary/15 text-primary border-primary/30 text-xs">
                    Completed
                  </Badge>
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">Stripe</h3>
                <div className="flex flex-wrap gap-2 mb-3">
                  <Badge variant="secondary" className="text-xs">SaaS / API-Platform</Badge>
                  <Badge variant="outline" className="text-xs">Financial Infrastructure</Badge>
                  <Badge variant="outline" className="text-xs">Product-Led Growth</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Payment processing infrastructure as a service. Revenue via transaction fees and
                  subscription-based products...
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Social Proof Stats */}
      <section className="py-12 border-t border-border">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center space-y-2">
                <div className="mx-auto w-10 h-10 rounded-lg bg-primary/15 flex items-center justify-center">
                  <stat.icon className="w-5 h-5 text-primary" />
                </div>
                <p className="text-2xl sm:text-3xl font-extrabold text-foreground">{stat.value}</p>
                <p className="text-xs sm:text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 sm:py-24 border-t border-border">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground mb-4">
              Everything you need to decode a market
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              One URL. One report. Complete market intelligence.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {features.map((feature) => (
              <Card key={feature.title} className="border-border bg-card">
                <CardContent className="p-6 space-y-4">
                  <div className="w-11 h-11 rounded-xl bg-primary/15 flex items-center justify-center">
                    <feature.icon className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="py-20 sm:py-24 border-t border-border">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground mb-4">
              Built for every intelligence workflow
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Whether you're researching competitors, entering a new market, or qualifying leads — Business Genome has you covered.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {useCases.map((uc) => (
              <Card key={uc.title} className="border-border bg-card">
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="w-11 h-11 rounded-xl bg-primary/15 flex items-center justify-center">
                      <uc.icon className="w-5 h-5 text-primary" />
                    </div>
                    <Badge variant="outline" className="text-xs">{uc.badge}</Badge>
                  </div>
                  <h3 className="text-lg font-bold text-foreground">{uc.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{uc.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="py-20 sm:py-24 border-t border-border">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground mb-4">
              How it works
            </h2>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              From URL to actionable intelligence in under 60 seconds.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step) => (
              <div key={step.step} className="text-center space-y-4">
                <div className="mx-auto w-14 h-14 rounded-2xl bg-muted flex items-center justify-center">
                  <step.icon className="w-6 h-6 text-primary" />
                </div>
                <span className="text-xs font-mono text-primary uppercase tracking-wider">
                  Step {step.step}
                </span>
                <h3 className="text-lg font-bold text-foreground">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-20 sm:py-24 border-t border-border">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground mb-4">
              Business Genome vs. Traditional Research
            </h2>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              Replace hours of manual research with structured, AI-powered analysis.
            </p>
          </div>
          <Card className="border-border bg-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-4 px-5 text-sm font-medium text-muted-foreground">Feature</th>
                    <th className="text-center py-4 px-5 text-sm font-medium text-primary">Business Genome</th>
                    <th className="text-center py-4 px-5 text-sm font-medium text-muted-foreground">Traditional Tools</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonRows.map((row) => (
                    <tr key={row.feature} className="border-b border-border/50">
                      <td className="py-3 px-5 text-sm text-foreground">{row.feature}</td>
                      <td className="py-3 px-5 text-center">
                        <div className="flex justify-center">
                          {typeof row.genome === "boolean" ? (
                            row.genome ? <Check className="w-4 h-4 text-primary" /> : <X className="w-4 h-4 text-muted-foreground/40" />
                          ) : (
                            <span className="text-sm font-medium text-primary">{row.genome}</span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-5 text-center">
                        <div className="flex justify-center">
                          {typeof row.traditional === "boolean" ? (
                            row.traditional ? <Check className="w-4 h-4 text-primary" /> : <X className="w-4 h-4 text-muted-foreground/40" />
                          ) : row.traditional === "partial" ? (
                            <Minus className="w-4 h-4 text-muted-foreground/60" />
                          ) : (
                            <span className="text-sm text-muted-foreground">{row.traditional}</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 sm:py-24 border-t border-border">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground mb-4">
              Trusted by researchers and strategists
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <Card key={t.name} className="border-border bg-card">
                <CardContent className="p-6 space-y-4">
                  <Quote className="w-6 h-6 text-primary/40" />
                  <p className="text-sm text-muted-foreground leading-relaxed italic">
                    "{t.quote}"
                  </p>
                  <div className="pt-2 border-t border-border">
                    <p className="text-sm font-medium text-foreground">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.role}, {t.company}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 sm:py-24 border-t border-border">
        <div className="container mx-auto px-4 max-w-2xl">
          <FAQSection items={homeFAQ} />
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 sm:py-24 border-t border-border">
        <div className="container mx-auto px-4 text-center max-w-2xl space-y-6">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground">
            Ready to decode your market?
          </h2>
          <p className="text-lg text-muted-foreground">
            Start with 3 free analyses per month. No credit card required.
          </p>
          <div className="pt-4">
            <Button size="lg" asChild className="text-base px-8 h-13">
              <Link to={isLoggedIn ? "/dashboard" : "/auth"}>
                Get Started Free
                <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;
