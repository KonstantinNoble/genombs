import { useState, useEffect, useRef, useCallback } from "react";
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
    if (!trimmed) return;
    if (isLoggedIn) {
      navigate("/chat?url=" + encodeURIComponent(trimmed));
    } else {
      navigate("/auth?redirect=" + encodeURIComponent("/chat?url=" + encodeURIComponent(trimmed)));
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
    {
      num: "04",
      title: "Code Analysis",
      description:
        "Connect a public GitHub repository and get your source code scored across six categories: quality, security, performance, accessibility, maintainability, and SEO.",
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
    {
      title: "Code Analysis",
      description:
        "Link your public GitHub repository and get your code scored across six categories — from security to maintainability.",
      badge: "Code Review",
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
    {
      question: "What is the Code Analysis?",
      answer:
        "You can connect a public GitHub repository to your scan. Our AI then analyzes your source code across six categories: code quality, security, performance, accessibility, maintainability, and SEO. The results are included alongside your website scores.",
    },
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
      <section className="relative flex items-center justify-center py-32 sm:py-40 overflow-hidden dot-grid">
        <div className="container mx-auto px-4 text-center max-w-3xl relative z-10">
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-semibold text-foreground leading-[1.08] mb-6 animate-fade-in">
            What's holding your <span className="text-primary">website</span> back?
          </h1>
          <p
            className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-12 animate-fade-in-up"
            style={{ animationDelay: "0.15s", animationFillMode: "both" }}
          >
            Paste a URL and get scores across five categories, competitor benchmarks, and a prioritized list of what to
            fix.
          </p>

          {/* URL Input Container */}
          <div
            className="url-input-container max-w-xl mx-auto bg-card border border-border rounded-lg p-1.5 flex items-center gap-2 animate-fade-in-up"
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
              className="text-base px-6 h-11 shrink-0"
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
              <p className="text-3xl sm:text-4xl font-semibold text-primary font-mono">Incl.</p>
              <p className="text-xs sm:text-sm text-muted-foreground uppercase tracking-wide">PageSpeed & Code Analysis</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 sm:py-28 relative">
        <div className="container mx-auto px-4 max-w-5xl relative z-10">
          <div className="text-center mb-16 scroll-reveal">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-foreground mb-5">What you get</h2>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              Scores, comparisons, and a concrete fix list for your website.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10">
            {features.map((feature, i) => (
              <div
                key={feature.title}
                className="accent-stripe border border-border bg-card rounded-lg p-8 space-y-5 stagger-reveal hover:border-primary/40 transition-colors duration-200"
                style={{ animationDelay: `${i * 0.15}s` }}
              >
                <span className="text-4xl font-semibold text-primary font-mono leading-none block">{feature.num}</span>
                <h3 className="text-xl font-medium text-foreground">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="py-20 sm:py-28 border-t border-border relative">
        <div className="container mx-auto px-4 max-w-4xl relative z-10">
          <div className="text-center mb-16 scroll-reveal">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-foreground mb-5">Use cases</h2>
          </div>
          <div className="space-y-0">
            {useCases.map((uc, i) => (
              <div
                key={uc.title}
                className={`flex flex-col md:flex-row items-start gap-6 md:gap-12 py-10 stagger-reveal ${
                  i < useCases.length - 1 ? "border-b border-border" : ""
                }`}
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <div className="md:w-1/4 shrink-0">
                  <span className="text-xs uppercase tracking-widest text-primary font-semibold font-mono">
                    {uc.badge}
                  </span>
                </div>
                <div className="md:w-3/4 space-y-3">
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
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-foreground mb-5">How it works</h2>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">Three steps. No setup required.</p>
          </div>
          {/* Horizontal timeline */}
          <div className="relative grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-0">
            {/* Connecting line */}
            <div className="hidden md:block absolute top-7 left-[16.67%] right-[16.67%] h-px bg-border" />
            {steps.map((step, i) => (
              <div
                key={step.step}
                className="relative text-center md:px-8 space-y-5 scroll-reveal-scale"
                style={{ transitionDelay: `${i * 0.15}s` }}
              >
                <div className="step-circle-pulse mx-auto w-14 h-14 rounded-full border-2 border-primary bg-background flex items-center justify-center relative z-10">
                  <span className="text-lg font-medium text-primary font-mono">{step.step}</span>
                </div>
                <h3 className="text-xl font-medium text-foreground">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-20 sm:py-28 border-t border-border">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="text-center mb-14 scroll-reveal">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-foreground mb-5">
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
                    <tr key={row.feature} className={`alt-row ${i < comparisonRows.length - 1 ? "border-b border-border" : ""}`}>
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

      {/* CTA */}
      <section className="py-20 sm:py-28 border-t border-border relative overflow-hidden dot-grid">
        <div className="container mx-auto px-4 text-center max-w-2xl relative z-10 scroll-reveal-scale">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-foreground mb-8">
            See what your website scores
          </h2>
          <Button
            size="lg"
            asChild
            className="text-base px-10 h-13"
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
