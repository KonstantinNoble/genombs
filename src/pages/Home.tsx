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
      num: "01",
      title: "ICP Builder",
      description:
        "Automatically identify your ideal customer profile — demographics, pain points, and goals — from your website content.",
    },
    {
      num: "02",
      title: "Audience Discovery",
      description:
        "Find out where your potential customers hang out online — from Reddit and LinkedIn to niche communities and forums.",
    },
    {
      num: "03",
      title: "Growth Playbook",
      description:
        "Get a complete growth strategy — organic and paid — with concrete channel recommendations, budgets, and targeting tips.",
    },
  ];

  const steps = [
    {
      step: "01",
      title: "Paste your URL",
      description: "Enter your website to start the scan.",
    },
    {
      step: "02",
      title: "AI scans your website",
      description: "Our engine analyzes your content, messaging, offers, and positioning.",
    },
    {
      step: "03",
      title: "Get your Growth Report",
      description: "Receive a structured report with ICP, audience channels, optimizations, and strategies.",
    },
  ];

  const useCases = [
    {
      title: "Launch Optimization",
      description: "Preparing to launch? Scan your site to find messaging gaps, missing trust elements, and funnel weaknesses before you go live.",
      badge: "Pre-Launch",
    },
    {
      title: "Customer Acquisition",
      description: "Discover where your audience hangs out and which channels will drive the highest-quality traffic to your business.",
      badge: "Growth",
    },
    {
      title: "Ad Strategy",
      description: "Get concrete paid advertising recommendations — channels, budgets, formats, and targeting strategies tailored to your segment.",
      badge: "Revenue",
    },
    {
      title: "Content Planning",
      description: "Understand what content formats and topics resonate with your audience. Find the gaps your competitors miss.",
      badge: "Content",
    },
  ];

  const comparisonRows = [
    { feature: "Analysis Speed", genome: "< 60 seconds", traditional: "Hours to days" },
    { feature: "Data Depth", genome: "7 structured sections", traditional: "Surface-level overview" },
    { feature: "Cost per Scan", genome: "Free / $26.99/mo unlimited", traditional: "$500+ per report" },
    { feature: "Automation", genome: "Yes", traditional: "No" },
    { feature: "Structured Output", genome: "Yes", traditional: "Partial" },
    { feature: "Actionable Strategies", genome: "Yes", traditional: "No" },
  ];

  const testimonials = [
    {
      quote: "We scanned our site before our Series A pitch. The ICP analysis and market sizing data gave us the ammunition we needed.",
      name: "Sarah K.",
      role: "Founder",
      company: "TechVentures Inc.",
    },
    {
      quote: "The audience channel recommendations alone were worth it. We found that our ICP is most active on communities we weren't even considering.",
      name: "Marcus L.",
      role: "Head of Growth",
      company: "GrowthStack",
    },
    {
      quote: "Business Genome replaced our quarterly agency reports. Faster, cheaper, and more actionable.",
      name: "Dr. Elena M.",
      role: "Strategy Lead",
      company: "Innovate Partners",
    },
  ];

  const homeFAQ = [
    {
      question: "What is a Growth Report?",
      answer: "A Growth Report is a structured analysis generated from your website. It identifies your ideal customers, where to find them, how to optimize your site, and which growth strategies to pursue — all based on your actual content and positioning.",
    },
    {
      question: "How accurate is the analysis?",
      answer: "Our AI engine combines web crawling, content extraction, and large language model analysis to achieve high accuracy. The system surfaces verifiable data points and clearly labels inferences. Traffic data comes from SimilarWeb for premium users.",
    },
    {
      question: "What data sources do you use?",
      answer: "We crawl your website's publicly available pages, extract structured data, and analyze content patterns using AI. For premium users, we also integrate SimilarWeb traffic data for visitor estimates, keywords, and traffic source breakdowns.",
    },
    {
      question: "How long does a scan take?",
      answer: "Most scans complete in under 60 seconds. Complex websites with many pages may take slightly longer. You'll see a real-time status update while the scan is running.",
    },
    {
      question: "Can I export reports?",
      answer: "Yes — premium users can export any Growth Report as a professionally formatted PDF. Useful for sharing with team members, clients, or stakeholders.",
    },
    {
      question: "Is my data secure?",
      answer: "Absolutely. We only analyze publicly available website data. Your account data is encrypted and stored securely. We are GDPR compliant and do not sell or share your analysis data with third parties.",
    },
  ];

  const stats = [
    { value: "500+", label: "Websites Scanned" },
    { value: "12", label: "Market Segments" },
    { value: "<60s", label: "Per Scan" },
    { value: "7", label: "Report Sections" },
  ];

  return (
    <div className="min-h-screen relative overflow-x-hidden flex flex-col">
      <SEOHead
        title="Business Genome – Turn your website into a growth engine"
        description="Scan your website and get a complete growth playbook — ICP, audience channels, optimization tips, and growth strategies in under 60 seconds."
        keywords="business growth, website analysis, ICP builder, audience discovery, growth strategy, SaaS analytics"
        canonical="/"
        ogImage="https://synoptas.com/synoptas-favicon.png"
      />
      <OrganizationSchema
        name="Synoptas"
        url="https://synoptas.com"
        logo="https://synoptas.com/synoptas-favicon.png"
        description="Business Genome – Business Growth Platform"
      />
      <WebPageSchema
        name="Business Genome – Turn your website into a growth engine"
        description="Scan your website and get a complete growth playbook."
        url="https://synoptas.com/"
      />
      <Navbar />

      {/* Hero */}
      <section className="flex items-center justify-center py-20 sm:py-28">
        <div className="container mx-auto px-4 text-center space-y-8 max-w-3xl">
          <Badge variant="outline" className="mb-2 text-sm">
            Business Growth Platform
          </Badge>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-foreground leading-tight">
            Turn your website into{" "}
            <span className="text-primary">a growth engine</span>
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
            Scan your website and get a complete growth playbook — ICP, audience channels, optimization tips, and strategies in under 60 seconds.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button size="lg" asChild className="text-base px-8 h-13">
              <Link to={isLoggedIn ? "/chat" : "/auth"}>
                Start Analyzing
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="text-base px-8 h-13">
              <Link to="/pricing">View Pricing</Link>
            </Button>
          </div>

          {/* Mini-preview */}
          <div className="pt-8 max-w-2xl mx-auto">
            <Card className="border-border bg-card text-left">
              <CardContent className="p-5 sm:p-6">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-sm font-mono text-muted-foreground">stripe.com</span>
                  <Badge variant="outline" className="bg-primary/15 text-primary border-primary/30 text-xs">
                    Completed
                  </Badge>
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">Growth Report: Stripe</h3>
                <div className="flex flex-wrap gap-2 mb-3">
                  <Badge variant="secondary" className="text-xs">SaaS / API-Platform</Badge>
                  <Badge variant="outline" className="text-xs">Financial Infrastructure</Badge>
                  <Badge variant="outline" className="text-xs">Growth Readiness: 92/100</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  3 ICP segments identified · 7 audience channels · 5 optimization recommendations...
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
                <p className="text-2xl sm:text-3xl font-extrabold text-foreground">{stat.value}</p>
                <p className="text-xs sm:text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 sm:py-24 border-t border-border">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground mb-4">
              Everything you need to grow your business
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              One URL. One scan. A complete growth playbook.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {features.map((feature) => (
              <Card key={feature.title} className="border-border bg-card">
                <CardContent className="p-6 space-y-4">
                  <span className="text-3xl font-extrabold text-primary/30">{feature.num}</span>
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

      {/* Use Cases */}
      <section className="py-20 sm:py-24 border-t border-border">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground mb-4">
              Built for every growth workflow
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Whether you're launching, scaling, or optimizing — Business Genome has you covered.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {useCases.map((uc) => (
              <Card key={uc.title} className="border-border bg-card">
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-start justify-between">
                    <span className="w-2 h-2 rounded-full bg-primary mt-2" />
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

      {/* How it Works */}
      <section className="py-20 sm:py-24 border-t border-border">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground mb-4">
              How it works
            </h2>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              From URL to growth playbook in under 60 seconds.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step) => (
              <div key={step.step} className="text-center space-y-4">
                <div className="mx-auto w-14 h-14 rounded-2xl bg-muted flex items-center justify-center">
                  <span className="text-lg font-bold text-primary">{step.step}</span>
                </div>
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
              Business Genome vs. Hiring a Consultant
            </h2>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              Replace hours of manual research with structured, AI-powered analysis.
            </p>
          </div>
          <Card className="border-border bg-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[480px]">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 sm:py-4 px-3 sm:px-5 text-xs sm:text-sm font-medium text-muted-foreground">Feature</th>
                    <th className="text-center py-3 sm:py-4 px-3 sm:px-5 text-xs sm:text-sm font-medium text-primary">Business Genome</th>
                    <th className="text-center py-3 sm:py-4 px-3 sm:px-5 text-xs sm:text-sm font-medium text-muted-foreground">Consultant</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonRows.map((row) => (
                    <tr key={row.feature} className="border-b border-border/50">
                      <td className="py-2.5 sm:py-3 px-3 sm:px-5 text-xs sm:text-sm text-foreground">{row.feature}</td>
                      <td className="py-2.5 sm:py-3 px-3 sm:px-5 text-center">
                        <span className={`text-xs sm:text-sm font-medium ${row.genome === "Yes" ? "text-primary" : "text-foreground"}`}>
                          {row.genome}
                        </span>
                      </td>
                      <td className="py-2.5 sm:py-3 px-3 sm:px-5 text-center">
                        <span className={`text-xs sm:text-sm ${row.traditional === "No" ? "text-muted-foreground/40" : "text-muted-foreground"}`}>
                          {row.traditional}
                        </span>
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
              Trusted by founders and growth teams
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <Card key={t.name} className="border-border bg-card">
                <CardContent className="p-6 space-y-4">
                  <span className="text-4xl font-serif text-primary/30">"</span>
                  <p className="text-sm text-muted-foreground leading-relaxed italic">
                    {t.quote}
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

      {/* CTA */}
      <section className="py-20 sm:py-24 border-t border-border">
        <div className="container mx-auto px-4 text-center max-w-2xl space-y-6">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground">
            Ready to grow your business?
          </h2>
          <p className="text-lg text-muted-foreground">
            Start with 3 free scans per month. No credit card required.
          </p>
          <div className="pt-4">
            <Button size="lg" asChild className="text-base px-8 h-13">
              <Link to={isLoggedIn ? "/dashboard" : "/auth"}>
                Get Started Free
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
