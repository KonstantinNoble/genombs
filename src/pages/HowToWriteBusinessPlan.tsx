import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { SEOHead } from "@/components/seo/SEOHead";
import { BreadcrumbSchema } from "@/components/seo/StructuredData";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, ArrowRight, FileText, Target, Users, BarChart3, Megaphone, DollarSign, Lightbulb } from "lucide-react";
import { Helmet } from "react-helmet-async";

const steps = [
  {
    number: 1,
    title: "Executive Summary",
    icon: FileText,
    description: "Write a compelling overview of your entire business plan. This is the first thing investors read, so make it count.",
    tips: [
      "Keep it to 1-2 pages maximum",
      "Write it last, after completing all other sections",
      "Include your mission statement and value proposition",
      "Highlight key financial projections and funding needs"
    ]
  },
  {
    number: 2,
    title: "Company Description",
    icon: Target,
    description: "Explain what your business does, what problems it solves, and what makes it unique in the market.",
    tips: [
      "Define your business structure (LLC, Corporation, etc.)",
      "Describe your products or services in detail",
      "Identify your target market and customer segments",
      "Explain your competitive advantages"
    ]
  },
  {
    number: 3,
    title: "Market Analysis",
    icon: BarChart3,
    description: "Research your industry, target market, and competitors. Use data to validate your business opportunity.",
    tips: [
      "Calculate your Total Addressable Market (TAM)",
      "Identify market trends and growth projections",
      "Analyze at least 3-5 direct competitors",
      "Use our AI Market Research tool for real-time data"
    ],
    cta: { text: "Try AI Market Research", link: "/market-research" }
  },
  {
    number: 4,
    title: "Organization & Management",
    icon: Users,
    description: "Outline your company structure, leadership team, and the expertise each member brings.",
    tips: [
      "Create an organizational chart",
      "Highlight relevant experience of key team members",
      "Identify any advisory board members or mentors",
      "Define roles and responsibilities clearly"
    ]
  },
  {
    number: 5,
    title: "Products or Services",
    icon: Lightbulb,
    description: "Detail what you're selling, how it benefits customers, and your product development roadmap.",
    tips: [
      "Explain the customer problem you're solving",
      "Describe your product lifecycle",
      "Include any patents, trademarks, or IP",
      "Outline future product development plans"
    ]
  },
  {
    number: 6,
    title: "Marketing Strategy",
    icon: Megaphone,
    description: "Define how you'll reach customers, your pricing strategy, and your sales approach.",
    tips: [
      "Identify your primary marketing channels",
      "Set customer acquisition cost (CAC) targets",
      "Define your pricing model and rationale",
      "Create a sales funnel strategy"
    ]
  },
  {
    number: 7,
    title: "Financial Projections",
    icon: DollarSign,
    description: "Create realistic financial forecasts including revenue, expenses, and profitability timelines.",
    tips: [
      "Project revenue for the next 3-5 years",
      "Include income statements and cash flow projections",
      "Calculate your break-even point",
      "Specify funding requirements and use of funds"
    ]
  }
];

const faqs = [
  {
    question: "How long should a business plan be?",
    answer: "A traditional business plan is typically 15-25 pages. However, a lean business plan can be as short as 1-2 pages. The length depends on your purpose – investors typically expect more detail, while internal planning can be more concise."
  },
  {
    question: "Do I need a business plan if I'm not seeking funding?",
    answer: "Yes! A business plan helps you clarify your strategy, identify potential challenges, and create a roadmap for growth. It's a valuable tool for any business, regardless of funding needs."
  },
  {
    question: "How often should I update my business plan?",
    answer: "Review and update your business plan at least quarterly. Major market changes, new competitors, or shifts in your business model should trigger immediate updates."
  },
  {
    question: "Can AI help me write a business plan?",
    answer: "Absolutely! AI tools like Synoptas can generate actionable business strategies based on your goals and real-time market data. This saves hours of research and provides data-driven insights you might miss on your own."
  }
];

const HowToWriteBusinessPlan = () => {
  return (
    <div className="min-h-screen relative overflow-hidden">
      <SEOHead
        title="How to Write a Business Plan: Complete 2025 Guide | Synoptas"
        description="Learn how to write a business plan step-by-step. Our complete guide covers executive summaries, market analysis, financial projections, and more. Free AI business plan generator included."
        keywords="how to write a business plan, business plan guide, business plan template, executive summary, market analysis, financial projections, business plan steps, AI business plan generator"
        canonical="/how-to-write-a-business-plan"
      />
      <BreadcrumbSchema
        items={[
          { name: "Home", url: "https://synoptas.com" },
          { name: "How to Write a Business Plan", url: "https://synoptas.com/how-to-write-a-business-plan" }
        ]}
      />
      
      {/* HowTo Schema for Rich Snippets */}
      <Helmet>
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "HowTo",
            "name": "How to Write a Business Plan",
            "description": "A comprehensive guide to writing a professional business plan in 7 steps.",
            "totalTime": "PT4H",
            "estimatedCost": {
              "@type": "MonetaryAmount",
              "currency": "USD",
              "value": "0"
            },
            "step": steps.map((step, index) => ({
              "@type": "HowToStep",
              "position": index + 1,
              "name": step.title,
              "text": step.description
            }))
          })}
        </script>
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": faqs.map(faq => ({
              "@type": "Question",
              "name": faq.question,
              "acceptedAnswer": {
                "@type": "Answer",
                "text": faq.answer
              }
            }))
          })}
        </script>
      </Helmet>

      <Navbar />
      
      <main className="pt-24 pb-16">
        {/* Hero Section */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 mb-16">
          <div className="max-w-4xl mx-auto text-center">
            <span className="inline-block px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              Complete 2025 Guide
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6">
              How to Write a <span className="text-primary">Business Plan</span>
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              A step-by-step guide to creating a professional business plan that attracts investors, 
              guides your strategy, and sets your business up for success. Whether you're a first-time 
              entrepreneur or scaling an existing business, this guide covers everything you need.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="rounded-2xl">
                <Link to="/business-tools">
                  Generate Your Plan with AI <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="rounded-2xl">
                <a href="#steps">Read the Guide</a>
              </Button>
            </div>
          </div>
        </section>

        {/* What is a Business Plan */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 mb-16">
          <div className="max-w-4xl mx-auto">
            <Card className="bg-card/80 backdrop-blur-sm border-border">
              <CardContent className="p-8">
                <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">
                  What is a Business Plan?
                </h2>
                <p className="text-muted-foreground mb-4">
                  A business plan is a formal document that outlines your business goals, strategies for 
                  achieving them, and the timeline for success. It serves multiple purposes: guiding your 
                  business decisions, attracting investors, securing loans, and aligning your team around 
                  a common vision.
                </p>
                <p className="text-muted-foreground">
                  Think of it as a roadmap for your business. Just as you wouldn't drive across the country 
                  without GPS, you shouldn't build a business without a plan. A well-crafted business plan 
                  helps you anticipate challenges, allocate resources effectively, and measure progress 
                  toward your goals.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Why Do You Need a Business Plan */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 mb-16">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-8 text-center">
              Why Do You Need a Business Plan?
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {[
                { title: "Secure Funding", desc: "Investors and lenders require a business plan to evaluate your business potential and risk." },
                { title: "Clarify Your Vision", desc: "Writing forces you to think through every aspect of your business and identify gaps." },
                { title: "Set Measurable Goals", desc: "A plan provides benchmarks to track progress and adjust strategy as needed." },
                { title: "Attract Partners", desc: "Potential partners and key hires want to see a clear vision before committing." },
                { title: "Reduce Risk", desc: "Planning helps you anticipate challenges and develop contingency strategies." },
                { title: "Guide Decision-Making", desc: "A plan serves as a reference point for strategic decisions as you grow." }
              ].map((item, i) => (
                <Card key={i} className="bg-card/60 backdrop-blur-sm border-border">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <CheckCircle className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                      <div>
                        <h3 className="font-semibold text-foreground mb-2">{item.title}</h3>
                        <p className="text-sm text-muted-foreground">{item.desc}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* 7 Steps */}
        <section id="steps" className="container mx-auto px-4 sm:px-6 lg:px-8 mb-16">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4 text-center">
              7 Steps to Write a Business Plan
            </h2>
            <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
              Follow these steps to create a comprehensive business plan. Each section builds on the 
              previous one, creating a cohesive document that tells your business story.
            </p>
            
            <div className="space-y-8">
              {steps.map((step) => (
                <Card key={step.number} className="bg-card/80 backdrop-blur-sm border-border overflow-hidden">
                  <CardContent className="p-0">
                    <div className="flex flex-col md:flex-row">
                      <div className="bg-primary/10 p-6 md:p-8 flex items-center justify-center md:w-48">
                        <div className="text-center">
                          <step.icon className="h-10 w-10 text-primary mx-auto mb-2" />
                          <span className="text-3xl font-bold text-primary">Step {step.number}</span>
                        </div>
                      </div>
                      <div className="p-6 md:p-8 flex-1">
                        <h3 className="text-xl font-bold text-foreground mb-3">{step.title}</h3>
                        <p className="text-muted-foreground mb-4">{step.description}</p>
                        <ul className="space-y-2 mb-4">
                          {step.tips.map((tip, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                              <CheckCircle className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                              {tip}
                            </li>
                          ))}
                        </ul>
                        {step.cta && (
                          <Button asChild variant="outline" size="sm" className="rounded-xl">
                            <Link to={step.cta.link}>
                              {step.cta.text} <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* AI CTA Section */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 mb-16">
          <div className="max-w-4xl mx-auto">
            <Card className="bg-gradient-to-br from-primary/20 to-primary/5 border-primary/20">
              <CardContent className="p-8 text-center">
                <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">
                  Skip the Guesswork – Let AI Write Your Business Plan
                </h2>
                <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                  Our AI Business Plan Generator creates actionable, phased strategies based on your 
                  goals and real-time market data. Get a professional business plan in minutes, not weeks.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button asChild size="lg" className="rounded-2xl">
                    <Link to="/business-tools">
                      Generate Your Business Plan <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="lg" className="rounded-2xl">
                    <Link to="/pricing">View Pricing</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 mb-16">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-8 text-center">
              Frequently Asked Questions
            </h2>
            <div className="space-y-4">
              {faqs.map((faq, i) => (
                <Card key={i} className="bg-card/60 backdrop-blur-sm border-border">
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-foreground mb-2">{faq.question}</h3>
                    <p className="text-sm text-muted-foreground">{faq.answer}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Related Resources */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-foreground mb-6 text-center">
              Related Resources
            </h2>
            <div className="grid md:grid-cols-3 gap-4">
              <Card className="bg-card/60 backdrop-blur-sm border-border hover:border-primary/50 transition-colors">
                <CardContent className="p-6">
                  <Link to="/business-strategies-for-small-business" className="block">
                    <h3 className="font-semibold text-foreground mb-2 hover:text-primary transition-colors">
                      Business Strategies for Small Business →
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Proven growth strategies tailored for small business owners.
                    </p>
                  </Link>
                </CardContent>
              </Card>
              <Card className="bg-card/60 backdrop-blur-sm border-border hover:border-primary/50 transition-colors">
                <CardContent className="p-6">
                  <Link to="/market-research" className="block">
                    <h3 className="font-semibold text-foreground mb-2 hover:text-primary transition-colors">
                      AI Market Research →
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Get real-time market data and competitor analysis.
                    </p>
                  </Link>
                </CardContent>
              </Card>
              <Card className="bg-card/60 backdrop-blur-sm border-border hover:border-primary/50 transition-colors">
                <CardContent className="p-6">
                  <Link to="/business-tools" className="block">
                    <h3 className="font-semibold text-foreground mb-2 hover:text-primary transition-colors">
                      AI Business Plan Generator →
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Create your business plan in minutes with AI.
                    </p>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default HowToWriteBusinessPlan;
