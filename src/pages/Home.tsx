import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/lib/supabase/external-client";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { SEOHead } from "@/components/seo/SEOHead";
import { WebPageSchema, OrganizationSchema, FAQSchema } from "@/components/seo/StructuredData";
import { useAuth } from "@/contexts/AuthContext";
import FAQSection from "@/components/genome/FAQSection";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

// Counter hook: animates from 0 to target when visible
function useCountUp(target: number, duration = 1500) {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started) {
          setStarted(true);
          obs.disconnect();
        }
      },
      { threshold: 0.5 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [started]);

  useEffect(() => {
    if (!started) return;
    const start = performance.now();
    const step = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
      setCount(Math.round(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [started, target, duration]);

  return { count, ref };
}

// Typing effect hook
function useTypingEffect(text: string, speed = 100, delay = 1000) {
  const [displayed, setDisplayed] = useState("");
  const [showCursor, setShowCursor] = useState(true);

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;
    let i = 0;

    timeout = setTimeout(() => {
      const interval = setInterval(() => {
        i++;
        setDisplayed(text.slice(0, i));
        if (i >= text.length) {
          clearInterval(interval);
          // Hide cursor after typing done
          setTimeout(() => setShowCursor(false), 2000);
        }
      }, speed);
    }, delay);

    return () => clearTimeout(timeout);
  }, [text, speed, delay]);

  return { displayed, showCursor };
}

const Home = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isLoggedIn = !!user;
  const [urlInput, setUrlInput] = useState("");
  const { displayed: typingPlaceholder, showCursor } = useTypingEffect("synvertas.com", 80, 1200);

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
      .querySelectorAll(".scroll-reveal, .scroll-reveal-left, .scroll-reveal-right, .scroll-reveal-scale, .stagger-reveal, .step-circle-pulse")
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

  const handleAnalyze = () => {
    const trimmed = urlInput.trim();
    if (isLoggedIn) {
      navigate(trimmed ? "/chat?url=" + encodeURIComponent(trimmed) : "/chat");
    } else {
      const destination = trimmed ? "/chat?url=" + encodeURIComponent(trimmed) : "/chat";
      navigate("/auth?redirect=" + encodeURIComponent(destination));
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleAnalyze();
  };

  // Counter refs for stats
  const counter1 = useCountUp(5);
  const counter2 = useCountUp(5);

  const features = [
    {
      num: "01",
      title: "Website Scoring & Insights",
      description:
        "Stop guessing what's wrong. Your site gets scored across Findability, Mobile Usability, Offer Clarity, Trust & Proof, and Conversion Readiness — so you know exactly where you're losing visitors and revenue.",
    },
    {
      num: "02",
      title: "Competitor Intelligence",
      description:
        "See where competitors outperform you — and where you already lead. Compare scores side-by-side with up to 3 competitors, or let our AI discover who you're really competing against.",
    },
    {
      num: "03",
      title: "Actionable Improvement Plan",
      description:
        "No more wondering what to fix first. Get a ranked list of concrete tasks — from missing trust signals to weak CTAs — each categorized and ready to hand off to your team or developer.",
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
        "Receive scores across 5 categories, competitor comparisons, and a prioritized improvement plan — all in your dashboard.",
    },
  ];

  const useCases = [
    {
      title: "Pre-Launch Check",
      description:
        "About to launch? Catch weak messaging, missing trust signals, and conversion killers before your audience sees them.",
      badge: "Pre-Launch",
    },
    {
      title: "Competitor Benchmarking",
      description:
        "Stop guessing where you stand. See your scores next to your competitors' — and know exactly where to invest.",
      badge: "Comparison",
    },
    {
      title: "Conversion Optimization",
      description:
        "Your visitors aren't converting? Find out if it's your CTAs, your trust elements, or your offer clarity — and get a fix list.",
      badge: "Optimization",
    },
    {
      title: "Performance Monitoring",
      description:
        "Slow websites lose customers. Track your Core Web Vitals and see how technical debt impacts your bottom line.",
      badge: "Performance",
    },
    {
      title: "Code Analysis",
      description:
        "Your codebase affects your growth. Connect your GitHub repo and get scored across security, performance, and maintainability.",
      badge: "Code Review",
    },
    {
      title: "Auto Competitor Discovery",
      description:
        "Don't know who you're competing against online? Our AI identifies your real competitors based on your positioning — no research needed.",
      badge: "AI-Powered",
    },
  ];

  const comparisonRows = [
    { feature: "Analysis Speed", genome: "< 60 seconds", traditional: "Hours to days" },
    { feature: "Data Depth", genome: "5 scoring categories + code analysis", traditional: "Surface-level overview" },
    { feature: "Cost", genome: "Free daily credits / $14.99/mo", traditional: "$500+ per report" },
    { feature: "AI Models", genome: "5 models", traditional: "N/A" },
    { feature: "Structured Output", genome: "Yes", traditional: "Partial" },
    { feature: "Improvement Tasks", genome: "Yes", traditional: "No" },
    { feature: "Auto Competitor Discovery", genome: "Yes", traditional: "Manual research" },
  ];

  const homeFAQ = [
    {
      question: "What is a Website Analysis?",
      answer:
        "A Website Analysis is a structured report generated from your URL. It scores your site across 5 categories: Findability, Mobile Usability, Offer Clarity, Trust and Proof, and Conversion Readiness. It includes competitor comparisons, optional code analysis, and prioritized improvement tasks.",
    },
    {
      question: "How does the credit system work?",
      answer:
        "You get 20 free credits per day (100 with Premium). Each scan costs 5–10 credits depending on the AI model, and each chat message costs 1–5 credits. Credits reset automatically every 24 hours.",
    },
    {
      question: "What AI models are available?",
      answer:
        "Free users get Gemini Flash (fast, great for quick questions) and GPT Mini (solid quality at low credit cost). Premium unlocks three additional models: GPT-4o (precise analysis and detailed answers), Claude Sonnet (nuanced reasoning and deep analysis), and Perplexity (real-time web search for current info).",
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
    {
      question: "What is the Code Analysis?",
      answer:
        "You can connect a public GitHub repository to your scan. Our AI then analyzes your source code across six categories: code quality, security, performance, accessibility, maintainability, and SEO. The results are included alongside your website scores.",
    },
    {
      question: "Can AI find my competitors for me?",
      answer:
        "Yes. When starting an analysis, you can toggle 'Find competitors automatically with AI.' Our system uses AI-powered web search to identify your most relevant competitors based on your website's industry and positioning. You then select which ones to include in the analysis.",
    },
  ];

  return (
    <div className="min-h-screen relative overflow-x-hidden flex flex-col">
      <SEOHead
        title="AI Website Audit & Competitor Analysis Tool"
        description="Find out why visitors leave without converting. AI-powered website scoring, competitor benchmarking, and a prioritized improvement plan — in under 60 seconds."
        keywords="website audit tool, website scoring, competitor analysis, conversion optimization, website improvement plan, SEO audit, site analyzer, code analysis"
        canonical="/"
        ogImage="https://synvertas.com/synvertas-logo.png"
      />
      <OrganizationSchema
        name="Synvertas"
        url="https://synvertas.com"
        logo="https://synvertas.com/synvertas-logo.png"
        description="Synvertas – AI-powered website scoring, competitor analysis, and improvement planning."
      />
      <WebPageSchema
        name="Synvertas – Turn your website into a growth engine"
        description="Find out why visitors leave without converting. Get AI-scored insights, competitor benchmarks, and a prioritized fix list in under 60 seconds."
        url="https://synvertas.com/"
      />
      <Navbar />

      {/* Hero */}
      <section className="relative flex items-center justify-center py-32 sm:py-40 overflow-hidden dot-grid">
        <div className="container mx-auto px-4 text-center max-w-3xl relative z-10">
          {/* Word-by-word reveal headline */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-normal text-foreground leading-[1.08] mb-6">
            <span className="sr-only">Website Scoring and Competitor Analysis Tool – </span>
            {["Your", "website", "could"].map((word, i) => (
              <span
                key={word}
                className="inline-block opacity-0 animate-fade-in-up"
                style={{ animationDelay: `${i * 0.15}s`, animationFillMode: "both" }}
              >
                {word}&nbsp;
              </span>
            ))}
            <span
              className="inline-block text-primary opacity-0 animate-fade-in-up"
              style={{
                animationDelay: "0.45s",
                animationFillMode: "both",
                textShadow: "0 0 20px hsl(25 95% 53% / 0.5), 0 0 40px hsl(25 95% 53% / 0.25), 0 0 60px hsl(25 95% 53% / 0.1)",
              }}
            >
              convert
            </span>{" "}
            {["more", "customers"].map((word, i) => (
              <span
                key={word}
                className="inline-block opacity-0 animate-fade-in-up"
                style={{ animationDelay: `${0.6 + i * 0.15}s`, animationFillMode: "both" }}
              >
                {word}{i < 1 ? "\u00A0" : ""}
              </span>
            ))}
          </h1>
          <p
            className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-12 animate-fade-in-up"
            style={{ animationDelay: "0.15s", animationFillMode: "both" }}
          >
            Find out why visitors leave without converting. Get AI-scored insights across findability, trust, and conversion readiness — plus see exactly how you stack up against your competitors.
          </p>

          {/* URL Input Container */}
          <div
            className="max-w-xl mx-auto bg-card border border-border rounded-lg p-1.5 flex items-center gap-2 animate-fade-in-up transition-[border-color,box-shadow] duration-200 focus-within:border-primary focus-within:shadow-[0_0_0_3px_hsl(var(--primary)/0.12)]"
            style={{ animationDelay: "0.3s", animationFillMode: "both" }}
          >
            <div className="flex-1 relative">
              <input
                type="text"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full bg-transparent text-foreground text-base px-4 py-3 outline-none font-mono placeholder:text-muted-foreground/50"
                placeholder=""
                aria-label="Enter website URL"
              />
              {/* Typing placeholder overlay */}
              {!urlInput && (
                <div className="absolute inset-0 flex items-center px-4 pointer-events-none">
                  <span className="text-muted-foreground/40 font-mono text-base">
                    {typingPlaceholder}
                    {showCursor && <span className="typing-cursor text-primary ml-px">|</span>}
                  </span>
                </div>
              )}
            </div>
            <Button
              onClick={handleAnalyze}
              size="lg"
              className="cta-btn-shimmer text-base px-6 h-11 shrink-0"
            >
              Analyze
            </Button>
          </div>

          <div className="flex flex-col items-center gap-3 mt-6 animate-fade-in-up" style={{ animationDelay: "0.45s", animationFillMode: "both" }}>
            <p className="text-sm text-muted-foreground">
              20 free credits per day. No credit card required.
            </p>
            <Link to="/pricing" className="text-sm text-primary hover:underline font-medium">
              View Pricing
            </Link>
          </div>
        </div>
      </section>

      {/* Social Proof Stats */}
      <section className="py-14 border-t border-b border-border bg-muted/20 relative">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-0">
            {/* Counter stats */}
            <div className="text-center py-4 md:py-0 space-y-1 scroll-reveal md:border-r md:border-border">
              <div ref={counter1.ref}>
                <p className="text-3xl sm:text-4xl font-semibold text-primary font-mono animate-count-fade">{counter1.count}</p>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground uppercase tracking-wide">AI Models</p>
            </div>
            <div className="text-center py-4 md:py-0 space-y-1 scroll-reveal md:border-r md:border-border" style={{ transitionDelay: "0.1s" }}>
              <div ref={counter2.ref}>
                <p className="text-3xl sm:text-4xl font-semibold text-primary font-mono animate-count-fade">{counter2.count}</p>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground uppercase tracking-wide">Score Categories</p>
            </div>
            <div className="text-center py-4 md:py-0 space-y-1 scroll-reveal md:border-r md:border-border" style={{ transitionDelay: "0.2s" }}>
              <p className="text-3xl sm:text-4xl font-semibold text-primary font-mono">&lt;60s</p>
              <p className="text-xs sm:text-sm text-muted-foreground uppercase tracking-wide">Per Scan</p>
            </div>
            <div className="text-center py-4 md:py-0 space-y-1 scroll-reveal" style={{ transitionDelay: "0.3s" }}>
              <p className="text-3xl sm:text-4xl font-semibold text-primary font-mono">AI</p>
              <p className="text-xs sm:text-sm text-muted-foreground uppercase tracking-wide">Auto Competitor Search</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 sm:py-28 relative">
        <div className="container mx-auto px-4 max-w-5xl relative z-10">
          <div className="text-center mb-16 scroll-reveal">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-medium text-foreground mb-5">Everything you need to outperform your competition</h2>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              Scores, comparisons, and a concrete fix list for your website.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, i) => (
              <div
                key={feature.title}
                className="border border-border bg-card rounded-lg p-8 space-y-4 stagger-reveal hover:border-primary/30 transition-colors duration-300"
                style={{ animationDelay: `${i * 0.15}s` }}
              >
                <span className="text-sm text-primary font-mono leading-none block">{feature.num}</span>
                <h3 className="text-lg font-medium text-foreground">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="py-20 sm:py-28 border-t border-border relative">
        <div className="container mx-auto px-4 max-w-4xl relative z-10">
          <div className="text-center mb-16 scroll-reveal">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-medium text-foreground mb-5">Use cases</h2>
          </div>
          <div className="space-y-0">
            {useCases.map((uc, i) => (
              <div
                key={uc.title}
                className={`flex flex-col md:flex-row items-start gap-6 md:gap-12 py-10 scroll-reveal ${i < useCases.length - 1 ? "border-b border-border" : ""
                  }`}
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <div className="md:w-1/4 shrink-0 scroll-reveal-left" style={{ transitionDelay: `${i * 0.1}s` }}>
                  <span className="text-xs uppercase tracking-widest text-primary font-semibold font-mono">
                    {uc.badge}
                  </span>
                </div>
                <div className="md:w-3/4 space-y-3 scroll-reveal-right" style={{ transitionDelay: `${i * 0.1}s` }}>
                  <h3 className="text-xl font-medium text-foreground">{uc.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{uc.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-20 sm:py-28 border-t border-border relative overflow-hidden">
        <div className="container mx-auto px-4 max-w-5xl relative z-10">
          <div className="text-center mb-16 scroll-reveal">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-medium text-foreground mb-5">How it works</h2>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">Three steps. No setup required.</p>
          </div>
          {/* Horizontal timeline */}
          <div className="relative grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-0">
            {/* Connecting line */}
            <div className="hidden md:block absolute top-5 left-[16.67%] right-[16.67%] h-px bg-border" />
            {steps.map((step, i) => (
              <div
                key={step.step}
                className="relative text-center md:px-8 space-y-4 scroll-reveal-scale"
                style={{ transitionDelay: `${i * 0.15}s` }}
              >
                <div className="mx-auto w-10 h-10 rounded-full border border-primary/40 bg-background flex items-center justify-center relative z-10">
                  <span className="text-sm text-primary font-mono">{step.step}</span>
                </div>
                <h3 className="text-base font-medium text-foreground">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-20 sm:py-28 border-t border-border">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="text-center mb-14 scroll-reveal">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-medium text-foreground mb-5">
              Compared to traditional consulting
            </h2>
          </div>
          <div className="border border-border rounded-lg overflow-hidden scroll-reveal-scale">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[480px]">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="text-left py-4 px-5 text-sm font-medium text-muted-foreground">Feature</th>
                    <th className="text-center py-4 px-5 text-sm font-medium text-primary font-mono">Synvertas</th>
                    <th className="text-center py-4 px-5 text-sm font-medium text-muted-foreground">Consultant</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonRows.map((row, i) => (
                    <tr key={row.feature} className={`alt-row stagger-reveal ${i < comparisonRows.length - 1 ? "border-b border-border" : ""}`} style={{ animationDelay: `${i * 0.08}s` }}>
                      <td className="py-3.5 px-5 text-sm text-foreground font-medium">{row.feature}</td>
                      <td className="py-3.5 px-5 text-center">
                        <span
                          className={`text-sm font-semibold ${row.genome === "Yes" ? "text-primary" : "text-foreground"}`}
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
      <section className="py-20 sm:py-28 border-t border-border">
        <div className="container mx-auto px-4 max-w-2xl scroll-reveal">
          <FAQSection items={homeFAQ} />
        </div>
      </section>
      <FAQSchema faqs={homeFAQ} />

      {/* CTA */}
      <section className="py-20 sm:py-28 border-t border-border relative overflow-hidden dot-grid">
        <div className="container mx-auto px-4 text-center max-w-2xl relative z-10 scroll-reveal-scale">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-medium text-foreground mb-8">
            Find out what's holding your website back
          </h2>
          <Button
            size="lg"
            asChild
            className="text-base px-10 h-13"
          >
            <Link to={isLoggedIn ? "/chat" : "/auth"} className="btn-glow">Get Started</Link>
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;
