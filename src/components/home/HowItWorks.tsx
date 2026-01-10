import { useScrollReveal } from "@/hooks/useScrollReveal";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const StepCard = ({ number, title, description, details, index, link, linkText }: { number: string; title: string; description: string; details: string; index: number; link: string; linkText: string }) => {
  const { ref, isVisible } = useScrollReveal();
  
  return (
    <div 
      ref={ref}
      className={`relative p-8 rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm scroll-reveal-left ${isVisible ? 'revealed' : ''}`}
      style={{ transitionDelay: `${index * 0.15}s` }}
    >
      <span className="absolute -top-5 left-8 flex items-center justify-center w-10 h-10 rounded-full bg-primary text-primary-foreground font-semibold text-lg">
        {number}
      </span>
      <h3 className="text-xl font-semibold mt-2 mb-4">{title}</h3>
      <p className="text-muted-foreground leading-relaxed mb-3">{description}</p>
      <p className="text-muted-foreground/80 text-sm leading-relaxed mb-4">{details}</p>
      <Link 
        to={link} 
        className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline transition-all duration-300 hover:gap-2"
      >
        {linkText}
        <ArrowRight className="w-4 h-4" />
      </Link>
    </div>
  );
};

const HowItWorks = () => {
  const { ref: headerRef, isVisible: headerVisible } = useScrollReveal();

  const steps = [
    {
      number: "1",
      title: "Describe Your Business Goal",
      description: "Enter your business objective – whether you're learning how to write a business plan or scaling an existing small business. Add optional context like budget, industry, or target audience. You can even include your website URL for personalized analysis based on your existing content and offerings.",
      details: "Be specific: 'I want to grow my freelance design business from $5k to $15k monthly revenue' works better than 'I want to make more money.' The more context you provide, the more tailored your strategy becomes.",
      link: "/business-tools",
      linkText: "Start Your Business Plan"
    },
    {
      number: "2",
      title: "AI Creates Your Business Strategy",
      description: "Our AI business plan generator analyzes your input using real-time market data from Perplexity AI. It creates business strategies for growth with weekly actions, realistic budgets, and measurable milestones tailored to your specific situation.",
      details: "Unlike ChatGPT, Synoptas doesn't rely on outdated training data. Every strategy is informed by current market trends, competitor activity, and industry benchmarks. You get actionable phases, not generic advice.",
      link: "/market-research",
      linkText: "Try Market Research"
    },
    {
      number: "3",
      title: "Execute & Track Progress",
      description: "Activate your strategy and track completion across all phases. Premium users unlock AI Autopilot – daily focus tasks selected by AI based on your strategy progress. Perfect for small business owners who want actionable business strategies to increase sales.",
      details: "Build momentum with streak tracking, phase milestones, and visual progress indicators. Each completed action moves you closer to your business goals with clear next steps.",
      link: "/my-strategies",
      linkText: "View Your Strategies"
    }
  ];

  return (
    <section className="py-20 sm:py-28 bg-muted/30 relative overflow-hidden" id="how-it-works">
      {/* Top fade transition from previous section */}
      <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-muted/50 to-transparent pointer-events-none" />
      {/* Bottom fade transition to next section */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background/30 to-transparent pointer-events-none" />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div 
          ref={headerRef}
          className={`text-center mb-16 scroll-reveal ${headerVisible ? 'revealed' : ''}`}
        >
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            How It Works
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            From goal to action plan in three simple steps
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
          {steps.map((step, index) => (
            <StepCard key={index} {...step} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
