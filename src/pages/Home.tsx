import { useEffect, useRef, useCallback } from "react";
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

const Home = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isLoggedIn = !!user;

  // Scroll reveal logic
  const observerRef = useRef<IntersectionObserver | null>(null);

  const setupObserver = useCallback(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("revealed");
            observerRef.current?.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -50px 0px" },
    );

    document
      .querySelectorAll(".scroll-reveal, .scroll-reveal-left, .scroll-reveal-right, .scroll-reveal-scale")
      .forEach((el) => {
        observerRef.current?.observe(el);
      });
  }, []);

  useEffect(() => {
    setupObserver();
    return () => observerRef.current?.disconnect();
  }, [setupObserver]);

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
            const { data: profile } = await supabase.from("profiles").select("id").eq("id", session.user.id).single();

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
      title: "Website Scoring",
      description:
        "Your website is scored across five categories: Findability, Mobile Usability, Offer Clarity, Trust and Proof, and Conversion Readiness.",
    },
    {
      num: "02",
      title: "Competitor Analysis",
      description:
        "Compare your website against up to 3 competitors. See strengths, weaknesses, and score differences side by side.",
    },
    {
      num: "03",
      title: "Improvement Plan",
      description: "Concrete, prioritized optimization tasks based on the analysis. Ready to execute.",
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
      title: "Get your analysis",
      description:
        "Receive scores across 5 categories, competitor comparisons, PageSpeed data, and an improvement plan.",
    },
  ];

  const useCases = [
    {
      title: "Pre-Launch Check",
      description:
        "Scan your site before launch to uncover messaging gaps, missing trust signals, and conversion weaknesses.",
      badge: "Pre-Launch",
    },
    {
      title: "Competitor Benchmarking",
      description:
        "Compare your scores side-by-side with up to 3 competitors. See exactly where you lead and where you fall behind.",
      badge: "Comparison",
    },
    {
      title: "Conversion Optimization",
      description:
        "Improve your CTAs, trust elements, and offer clarity based on AI-generated scoring and actionable improvement tasks.",
      badge: "Optimization",
    },
    {
      title: "Performance Monitoring",
      description:
        "Track your PageSpeed scores and Core Web Vitals. Understand how technical performance impacts your user experience.",
      badge: "Performance",
    },
  ];

  const comparisonRows = [
    { feature: "Analysis Speed", genome: "< 60 seconds", traditional: "Hours to days" },
    { feature: "Data Depth", genome: "5 scoring categories + PageSpeed", traditional: "Surface-level overview" },
    { feature: "Cost", genome: "Free daily credits / $14.99/mo", traditional: "$500+ per report" },
    { feature: "AI Models", genome: "5 models", traditional: "N/A" },
    { feature: "Structured Output", genome: "Yes", traditional: "Partial" },
    { feature: "Improvement Tasks", genome: "Yes", traditional: "No" },
  ];

  const homeFAQ = [
    {
      question: "What is a Website Analysis?",
      answer:
        "A Website Analysis is a structured report generated from your URL. It scores your site across 5 categories: Findability, Mobile Usability, Offer Clarity, Trust and Proof, and Conversion Readiness. It includes PageSpeed data, competitor comparisons, and prioritized improvement tasks.",
    },
    {
      question: "How does the credit system work?",
      answer:
        "You get 20 free credits per day (100 with Premium). Each scan costs 5–10 credits depending on the AI model, and each chat message costs 1–5 credits. Credits reset automatically every 24 hours.",
    },
    {
      question: "What AI models are available?",
      answer:
        "Free users have access to Gemini Flash and GPT Mini. Premium users unlock all 5 models: Gemini Flash, GPT Mini, GPT-4o, Claude Sonnet, and Perplexity.",
    },
    {
      question: "How long does a scan take?",
      answer:
        "Most scans complete in under 60 seconds. Complex websites with many pages may take slightly longer. You'll see a real-time status update while the scan is running.",
    },
    {
      question: "Is my data secure?",
      answer:
        "We only analyze publicly available website data. Your account data is encrypted and stored securely. We are GDPR compliant and do not sell or share your analysis data with third parties.",
    },
  ];

  const stats = [
    { value: "5", label: "AI Models" },
    { value: "5", label: "Score Categories" },
    { value: "<60s", label: "Per Scan" },
    { value: "Incl.", label: "PageSpeed Data" },
  ];

  return (
    <div className="min-h-screen relative overflow-x-hidden flex flex-col">
      <SEOHead
        title="Synvertas – Turn your website into a growth engine"
        description="Scan your website and get AI-powered scoring, competitor analysis, PageSpeed insights, and an improvement plan in under 60 seconds."
        keywords="website analysis, website scoring, competitor analysis, PageSpeed insights, conversion optimization, SEO audit"
        canonical="/"
        ogImage="https://synvertas.com/synvertas-logo.png"
      />
      <OrganizationSchema
        name="Synvertas"
        url="https://synvertas.com"
        logo="https://synvertas.com/synvertas-logo.png"
        description="Synvertas – Website Analysis Platform"
      />
      <WebPageSchema
        name="Synvertas – Turn your website into a growth engine"
        description="Scan your website and get AI-powered scoring, competitor analysis, PageSpeed insights, and an improvement plan in under 60 seconds."
        url="https://synvertas.com/"
      />
      <Navbar />

      {/* Hero */}
      <section className="relative flex items-center justify-center py-28 sm:py-36 overflow-hidden">
        {/* Neon glow orbs */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/10 blur-[120px] animate-pulse-soft pointer-events-none" />
        <div className="absolute top-1/4 right-1/4 w-[300px] h-[300px] rounded-full bg-primary/5 blur-[80px] animate-morph-blob pointer-events-none" />

        <div className="container mx-auto px-4 text-center max-w-3xl relative z-10">
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-foreground leading-[1.08] mb-6 animate-fade-in">
            What's holding your <span className="neon-text neon-pulse">website</span> back?
          </h1>
          <p
            className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 animate-fade-in-up"
            style={{ animationDelay: "0.15s", animationFillMode: "both" }}
          >
            Paste a URL and get scores across five categories, competitor benchmarks, and a prioritized list of what to
            fix.
          </p>
          <div
            className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up"
            style={{ animationDelay: "0.3s", animationFillMode: "both" }}
          >
            <Button
              size="lg"
              asChild
              className="text-base px-8 h-13 shadow-glow hover:shadow-neon transition-shadow duration-500"
            >
              <Link to={isLoggedIn ? "/chat" : "/auth"}>Start Analyzing</Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              asChild
              className="text-base px-8 h-13 neon-border hover:bg-primary/10 transition-all duration-500"
            >
              <Link to="/pricing">View Pricing</Link>
            </Button>
          </div>
          <p
            className="text-sm text-muted-foreground mt-8 animate-fade-in-up"
            style={{ animationDelay: "0.45s", animationFillMode: "both" }}
          >
            20 free credits per day. No credit card required.
          </p>
        </div>
      </section>

      {/* Social Proof Stats */}
      <section className="py-14 border-t border-b border-primary/20 relative glow-line">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-0">
            {stats.map((stat, i) => (
              <div
                key={stat.label}
                className={`text-center py-4 md:py-0 space-y-1 scroll-reveal ${
                  i < stats.length - 1 ? "md:border-r md:border-primary/15" : ""
                }`}
                style={{ transitionDelay: `${i * 0.1}s` }}
              >
                <p className="text-3xl sm:text-4xl font-extrabold text-primary">{stat.value}</p>
                <p className="text-xs sm:text-sm text-muted-foreground uppercase tracking-wide">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 sm:py-28 relative">
        <div className="absolute top-0 left-0 w-[400px] h-[400px] rounded-full bg-primary/5 blur-[100px] pointer-events-none" />
        <div className="container mx-auto px-4 max-w-5xl relative z-10">
          <div className="text-center mb-16 scroll-reveal">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-foreground mb-5">What you get</h2>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              Scores, comparisons, and a concrete fix list for your website.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
            {features.map((feature, i) => (
              <div
                key={feature.title}
                className="neon-card rounded-2xl p-8 space-y-5 scroll-reveal"
                style={{ transitionDelay: `${i * 0.12}s` }}
              >
                <span className="text-4xl font-extrabold neon-text leading-none block">{feature.num}</span>
                <h3 className="text-xl font-bold text-foreground">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="py-20 sm:py-28 border-t border-primary/15 relative">
        <div className="absolute bottom-0 right-0 w-[350px] h-[350px] rounded-full bg-primary/5 blur-[100px] pointer-events-none" />
        <div className="container mx-auto px-4 max-w-4xl relative z-10">
          <div className="text-center mb-16 scroll-reveal">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-foreground mb-5">Use cases</h2>
          </div>
          <div className="space-y-0">
            {useCases.map((uc, i) => (
              <div
                key={uc.title}
                className={`flex flex-col md:flex-row items-start gap-6 md:gap-12 py-10 scroll-reveal ${
                  i < useCases.length - 1 ? "border-b border-primary/10" : ""
                }`}
                style={{ transitionDelay: `${i * 0.08}s` }}
              >
                <div className="md:w-1/4 shrink-0">
                  <span className="text-xs uppercase tracking-widest text-primary font-semibold neon-text">
                    {uc.badge}
                  </span>
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
      <section className="py-20 sm:py-28 border-t border-primary/15 relative overflow-hidden">
        <div className="container mx-auto px-4 max-w-5xl relative z-10">
          <div className="text-center mb-16 scroll-reveal">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-foreground mb-5">How it works</h2>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">Three steps. No setup required.</p>
          </div>
          {/* Horizontal timeline */}
          <div className="relative grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-0">
            {/* Connecting line with neon glow */}
            <div className="hidden md:block absolute top-7 left-[16.67%] right-[16.67%] h-px bg-primary/30 shadow-[0_0_8px_hsl(25_95%_53%/0.3)]" />
            {steps.map((step, i) => (
              <div
                key={step.step}
                className="relative text-center md:px-8 space-y-5 scroll-reveal-scale"
                style={{ transitionDelay: `${i * 0.15}s` }}
              >
                <div className="mx-auto w-14 h-14 rounded-full border-2 border-primary bg-background flex items-center justify-center relative z-10 shadow-glow animate-pulse-glow">
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
      <section className="py-20 sm:py-28 border-t border-primary/15">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="text-center mb-14 scroll-reveal">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-foreground mb-5">
              Compared to traditional consulting
            </h2>
          </div>
          <div className="neon-card rounded-xl overflow-hidden scroll-reveal-scale">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[480px]">
                <thead>
                  <tr className="border-b border-primary/20 bg-primary/5">
                    <th className="text-left py-4 px-5 text-sm font-medium text-muted-foreground">Feature</th>
                    <th className="text-center py-4 px-5 text-sm font-bold text-primary neon-text">Synvertas</th>
                    <th className="text-center py-4 px-5 text-sm font-medium text-muted-foreground">Consultant</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonRows.map((row, i) => (
                    <tr key={row.feature} className={i < comparisonRows.length - 1 ? "border-b border-primary/10" : ""}>
                      <td className="py-3.5 px-5 text-sm text-foreground font-medium">{row.feature}</td>
                      <td className="py-3.5 px-5 text-center">
                        <span
                          className={`text-sm font-semibold ${row.genome === "Yes" ? "text-primary neon-text" : "text-foreground"}`}
                        >
                          {row.genome}
                        </span>
                      </td>
                      <td className="py-3.5 px-5 text-center">
                        <span
                          className={`text-sm ${row.traditional === "No" ? "text-muted-foreground/30" : "text-muted-foreground"}`}
                        >
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
      <section className="py-20 sm:py-28 border-t border-primary/15">
        <div className="container mx-auto px-4 max-w-2xl scroll-reveal">
          <FAQSection items={homeFAQ} />
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 sm:py-28 border-t border-primary/15 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-primary/8 blur-[100px] animate-pulse-soft pointer-events-none" />
        <div className="container mx-auto px-4 text-center max-w-2xl relative z-10 scroll-reveal-scale">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-foreground mb-8">
            See what your website scores
          </h2>
          <Button
            size="lg"
            asChild
            className="text-base px-10 h-13 shadow-glow hover:shadow-neon transition-shadow duration-500"
          >
            <Link to={isLoggedIn ? "/chat" : "/auth"}>Get Started</Link>
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;
