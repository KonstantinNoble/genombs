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
    { feature: "Cost", genome: "Free daily credits / $26.99/mo", traditional: "$500+ per report" },
    { feature: "AI Models", genome: "5 models", traditional: "N/A" },
    { feature: "Structured Output", genome: "Yes", traditional: "Partial" },
    { feature: "Actionable Strategies", genome: "Yes", traditional: "No" },
  ];


  const homeFAQ = [
    {
      question: "What is a Growth Report?",
      answer: "A Growth Report is a structured analysis generated from your website. It scores your site across 5 categories — Findability, Mobile Usability, Offer Clarity, Trust & Proof, and Conversion Readiness — and provides ICP profiles, audience channels, and optimization recommendations.",
    },
    {
      question: "How does the credit system work?",
      answer: "You get 20 free credits per day (100 with Premium). Each scan costs 5–10 credits depending on the AI model, and each chat message costs 1–5 credits. Credits reset automatically every 24 hours.",
    },
    {
      question: "What AI models are available?",
      answer: "Free users have access to Gemini Flash and GPT Mini. Premium users unlock all 5 models: Gemini Flash, GPT Mini, GPT-4o, Claude Sonnet, and Perplexity.",
    },
    {
      question: "How long does a scan take?",
      answer: "Most scans complete in under 60 seconds. Complex websites with many pages may take slightly longer. You'll see a real-time status update while the scan is running.",
    },
    {
      question: "Is my data secure?",
      answer: "Absolutely. We only analyze publicly available website data. Your account data is encrypted and stored securely. We are GDPR compliant and do not sell or share your analysis data with third parties.",
    },
  ];

  const stats = [
    { value: "5", label: "AI Models" },
    { value: "5", label: "Score Categories" },
    { value: "<60s", label: "Per Scan" },
    { value: "✓", label: "PageSpeed Included" },
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
      <section className="flex items-center justify-center py-24 sm:py-32">
        <div className="container mx-auto px-4 text-center max-w-3xl">
          <p className="text-sm uppercase tracking-widest text-primary font-medium mb-6">
            Business Growth Platform
          </p>
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-foreground leading-[1.08] mb-6">
            Turn your website into{" "}
            <span className="text-primary">a growth engine</span>
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
            One URL. One scan. A complete growth playbook with ICP, audience channels, and strategies — in under 60 seconds.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild className="text-base px-8 h-13">
              <Link to={isLoggedIn ? "/chat" : "/auth"}>
                Start Analyzing
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="text-base px-8 h-13">
              <Link to="/pricing">View Pricing</Link>
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mt-8">
            20 free credits per day — no credit card required
          </p>
        </div>
      </section>

      {/* Social Proof Stats */}
      <section className="py-14 border-t border-b border-border">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-0">
            {stats.map((stat, i) => (
              <div
                key={stat.label}
                className={`text-center py-4 md:py-0 space-y-1 ${
                  i < stats.length - 1 ? "md:border-r md:border-border" : ""
                }`}
              >
                <p className="text-3xl sm:text-4xl font-extrabold text-foreground">{stat.value}</p>
                <p className="text-xs sm:text-sm text-muted-foreground uppercase tracking-wide">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 sm:py-32">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center mb-20">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-foreground mb-5">
              Everything you need to grow
            </h2>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              One URL. One scan. A complete growth playbook.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
            {features.map((feature) => (
              <div key={feature.title} className="space-y-5">
                <span className="text-6xl font-extrabold text-primary/20 leading-none block">{feature.num}</span>
                <h3 className="text-xl font-bold text-foreground">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="py-24 sm:py-32 border-t border-border">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-20">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-foreground mb-5">
              Built for every growth workflow
            </h2>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              Whether you're launching, scaling, or optimizing — Business Genome has you covered.
            </p>
          </div>
          <div className="space-y-0">
            {useCases.map((uc, i) => (
              <div
                key={uc.title}
                className={`flex flex-col md:flex-row items-start gap-6 md:gap-12 py-10 ${
                  i < useCases.length - 1 ? "border-b border-border" : ""
                } ${i % 2 === 1 ? "md:flex-row-reverse" : ""}`}
              >
                <div className="md:w-1/4 shrink-0">
                  <span className="text-xs uppercase tracking-widest text-primary font-medium">{uc.badge}</span>
                </div>
                <div className="md:w-3/4 space-y-3">
                  <h3 className="text-xl font-bold text-foreground">{uc.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{uc.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-24 sm:py-32 border-t border-border">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center mb-20">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-foreground mb-5">
              How it works
            </h2>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              From URL to growth playbook in under 60 seconds.
            </p>
          </div>
          {/* Horizontal timeline */}
          <div className="relative grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-0">
            {/* Connecting line (desktop only) */}
            <div className="hidden md:block absolute top-7 left-[16.67%] right-[16.67%] h-px bg-border" />
            {steps.map((step) => (
              <div key={step.step} className="relative text-center md:px-8 space-y-5">
                <div className="mx-auto w-14 h-14 rounded-full border-2 border-primary bg-background flex items-center justify-center relative z-10">
                  <span className="text-lg font-bold text-primary">{step.step}</span>
                </div>
                <h3 className="text-xl font-bold text-foreground">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-24 sm:py-32 border-t border-border">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-foreground mb-5">
              Business Genome vs. Consultant
            </h2>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              Replace hours of manual research with structured, AI-powered analysis.
            </p>
          </div>
          <div className="border border-border rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[480px]">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="text-left py-4 px-5 text-sm font-medium text-muted-foreground">Feature</th>
                    <th className="text-center py-4 px-5 text-sm font-bold text-primary">Business Genome</th>
                    <th className="text-center py-4 px-5 text-sm font-medium text-muted-foreground">Consultant</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonRows.map((row, i) => (
                    <tr key={row.feature} className={i < comparisonRows.length - 1 ? "border-b border-border/50" : ""}>
                      <td className="py-3.5 px-5 text-sm text-foreground font-medium">{row.feature}</td>
                      <td className="py-3.5 px-5 text-center">
                        <span className={`text-sm font-semibold ${row.genome === "Yes" ? "text-primary" : "text-foreground"}`}>
                          {row.genome}
                        </span>
                      </td>
                      <td className="py-3.5 px-5 text-center">
                        <span className={`text-sm ${row.traditional === "No" ? "text-muted-foreground/30" : "text-muted-foreground"}`}>
                          {row.traditional}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>


      {/* FAQ */}
      <section className="py-24 sm:py-32 border-t border-border">
        <div className="container mx-auto px-4 max-w-2xl">
          <FAQSection items={homeFAQ} />
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 sm:py-32 border-t border-border">
        <div className="container mx-auto px-4 text-center max-w-2xl">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-foreground mb-5">
            Ready to grow your business?
          </h2>
          <p className="text-lg text-muted-foreground mb-10">
            20 free credits per day. No credit card required.
          </p>
          <Button size="lg" asChild className="text-base px-10 h-13">
            <Link to={isLoggedIn ? "/chat" : "/auth"}>
              Get Started Free
            </Link>
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;
