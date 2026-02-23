import { useEffect, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { SEOHead } from "@/components/seo/SEOHead";
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const steps = [
  {
    step: "01",
    title: "Paste your URL",
    description:
      "Enter any website URL. Our engine crawls and structures the entire page — content, CTAs, trust signals, offers, and messaging hierarchy.",
  },
  {
    step: "02",
    title: "AI analyzes everything",
    description:
      "Your website is scored across 5 categories: Findability, Mobile Usability, Offer Clarity, Trust & Proof, and Conversion Readiness. PageSpeed data and competitor benchmarks are included automatically.",
  },
  {
    step: "03",
    title: "Get scores, tasks & insights",
    description:
      "Receive a detailed dashboard with category scores, an overall rating, a prioritized improvement plan, and exportable results — all in under 60 seconds.",
  },
];

const codeCategories = [
  "Quality",
  "Security",
  "Performance",
  "Accessibility",
  "Maintainability",
  "SEO",
];

const aiModels = [
  {
    name: "Gemini Flash",
    description: "Fast responses for quick questions",
    credits: 1,
    tier: "Free",
  },
  {
    name: "GPT Mini",
    description: "Solid quality at low credit cost",
    credits: 1,
    tier: "Free",
  },
  {
    name: "GPT-4o",
    description: "Precise analysis and detailed answers",
    credits: 4,
    tier: "Premium",
  },
  {
    name: "Claude Sonnet",
    description: "Nuanced reasoning and deep analysis",
    credits: 5,
    tier: "Premium",
  },
  {
    name: "Perplexity",
    description: "Real-time web search for current info",
    credits: 5,
    tier: "Premium",
  },
];

const chatCapabilities = [
  "Ask specific questions about your website's strengths and weaknesses",
  "Get detailed explanations for any score or category",
  "Request concrete improvement suggestions with implementation steps",
  "Compare your website against competitors and ask follow-up questions",
  "Analyze your code and ask about security, performance, or best practices",
];

const HowItWorks = () => {
  const { user } = useAuth();
  const isLoggedIn = !!user;

  // Scroll reveal observer (same pattern as Homepage)
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

  return (
    <div className="min-h-screen bg-background/60 flex flex-col">
      <SEOHead
        title="How It Works – Scan, Score, Improve"
        description="Paste your URL, get AI-powered scores across 5 categories, and receive a prioritized improvement plan. Three steps, under 60 seconds, no setup needed."
        keywords="how website analysis works, website scoring process, AI website audit steps"
        canonical="/how-it-works"
      />

      <Navbar />

      <main className="flex-1">
        {/* Hero */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 dot-grid">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold text-foreground leading-[1.08] mb-6 animate-fade-in">
              How Synvertas works
            </h1>
            <p
              className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto animate-fade-in-up"
              style={{ animationDelay: "0.15s", animationFillMode: "both" }}
            >
              From URL to actionable insights in under 60 seconds.
            </p>
          </div>
        </section>

        {/* Analysis Process */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-24 border-t border-border">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16 scroll-reveal">
              <h2 className="text-3xl sm:text-4xl font-semibold text-foreground mb-5">
                Website Analysis
              </h2>
              <p className="text-lg text-muted-foreground max-w-xl mx-auto">
                Three steps from URL to a complete analysis with scores, benchmarks, and a fix list.
              </p>
            </div>

            <div className="relative space-y-0">
              {/* Vertical connecting line */}
              <div className="absolute left-[1.65rem] top-14 bottom-14 w-px bg-primary/20 hidden md:block" />

              {steps.map((step, i) => (
                <div
                  key={step.step}
                  className={`flex flex-col md:flex-row items-start gap-6 md:gap-10 py-10 accent-stripe stagger-reveal ${
                    i < steps.length - 1 ? "border-b border-border" : ""
                  }`}
                  style={{ animationDelay: `${i * 0.15}s` }}
                >
                  <div className="step-circle-pulse w-14 h-14 rounded-full border-2 border-primary bg-background flex items-center justify-center shrink-0 relative z-10">
                    <span className="text-lg font-medium text-primary font-mono">
                      {step.step}
                    </span>
                  </div>
                  <div className="space-y-3">
                    <h3 className="text-xl font-medium text-foreground">
                      {step.title}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed max-w-2xl">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Code Analysis */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-24 border-t border-border">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16 scroll-reveal">
              <h2 className="text-3xl sm:text-4xl font-semibold text-foreground mb-5">
                Code Analysis
              </h2>
              <p className="text-lg text-muted-foreground max-w-xl mx-auto">
                Connect a public GitHub repository and get your source code scored alongside your website.
              </p>
            </div>

            <div className="border border-border bg-card rounded-lg p-8 sm:p-10 space-y-8 scroll-reveal-scale">
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-foreground">
                  How it works
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  During a website scan, you can optionally provide a public GitHub repository URL. Our AI clones the repository, analyzes the codebase, and scores it across six categories. The results appear alongside your website scores in a unified dashboard.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-medium text-foreground mb-4">
                  Scoring categories
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {codeCategories.map((cat, i) => (
                    <div
                      key={cat}
                      className="accent-stripe border border-border rounded-lg px-4 py-3 text-sm text-foreground font-medium text-center stagger-reveal"
                      style={{ animationDelay: `${i * 0.08}s` }}
                    >
                      {cat}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* AI Models */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-24 border-t border-border">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16 scroll-reveal">
              <h2 className="text-3xl sm:text-4xl font-semibold text-foreground mb-5">
                5 AI Models
              </h2>
              <p className="text-lg text-muted-foreground max-w-xl mx-auto">
                Each model brings different strengths. Choose the right one for your question.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {aiModels.map((model, i) => (
                <div
                  key={model.name}
                  className="border border-border bg-card rounded-lg p-6 space-y-4 hover-lift hover:border-primary/40 stagger-reveal"
                  style={{ animationDelay: `${i * 0.1}s` }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-lg font-medium text-foreground">
                      {model.name}
                    </h3>
                    <Badge
                      variant={model.tier === "Premium" ? "default" : "secondary"}
                      className="shrink-0 text-xs"
                    >
                      {model.tier}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {model.description}
                  </p>
                  <p className="text-xs text-muted-foreground font-mono">
                    {model.credits} {model.credits === 1 ? "credit" : "credits"} per use
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* AI Chat */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-24 border-t border-border">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16 scroll-reveal">
              <h2 className="text-3xl sm:text-4xl font-semibold text-foreground mb-5">
                AI Chat
              </h2>
              <p className="text-lg text-muted-foreground max-w-xl mx-auto">
                After your analysis, ask the AI models targeted questions about your website or code.
              </p>
            </div>

            <div className="border border-border bg-card rounded-lg p-8 sm:p-10 scroll-reveal-scale">
              <ul className="space-y-4">
                {chatCapabilities.map((cap, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm stagger-reveal" style={{ animationDelay: `${i * 0.08}s` }}>
                    <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0 mt-1.5" />
                    <span className="text-foreground leading-relaxed">{cap}</span>
                  </li>
                ))}
              </ul>
              <p className="text-sm text-muted-foreground mt-6">
                Each model brings its own perspective — switch between them to get different insights on the same data.
              </p>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-24 border-t border-border dot-grid">
          <div className="max-w-2xl mx-auto text-center scroll-reveal-scale">
            <div className="border border-border rounded-xl p-10 sm:p-14 space-y-6">
              <h2 className="text-3xl sm:text-4xl font-semibold text-foreground">
                Ready to analyze your website?
              </h2>
              <p className="text-lg text-muted-foreground">
                Start free with 20 daily credits. No credit card required.
              </p>
              <div className="pt-2">
                <Button
                  size="lg"
                  className="px-10 h-13 btn-glow"
                  asChild
                >
                  <Link to={isLoggedIn ? "/chat" : "/auth"}>
                    {isLoggedIn ? "Go to Dashboard" : "Get Started"}
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default HowItWorks;
