import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { SEOHead } from "@/components/seo/SEOHead";
import { BreadcrumbSchema } from "@/components/seo/StructuredData";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, ArrowRight, TrendingUp, Users, Target, Zap, Globe, Wallet, BarChart, Rocket } from "lucide-react";
import { Helmet } from "react-helmet-async";

const strategies = [
  {
    title: "Focus on Your Niche",
    icon: Target,
    description: "Small businesses thrive by being specialists, not generalists. Instead of competing with big players on everything, dominate a specific market segment.",
    actionItems: [
      "Identify your most profitable customer segment",
      "Become the go-to expert in your specific niche",
      "Create content that addresses niche-specific problems",
      "Build partnerships with complementary businesses"
    ]
  },
  {
    title: "Leverage Digital Marketing",
    icon: Globe,
    description: "Digital marketing levels the playing field. With the right strategy, a small business can outperform larger competitors online.",
    actionItems: [
      "Optimize your Google Business Profile for local SEO",
      "Build an email list and nurture leads with valuable content",
      "Use social media platforms where your customers are active",
      "Consider paid ads with a small, targeted budget"
    ]
  },
  {
    title: "Build Customer Loyalty",
    icon: Users,
    description: "Acquiring a new customer costs 5x more than retaining one. Small businesses can excel at personal relationships big companies can't match.",
    actionItems: [
      "Create a simple loyalty or rewards program",
      "Follow up personally after purchases",
      "Ask for feedback and actually implement it",
      "Celebrate customer milestones and anniversaries"
    ]
  },
  {
    title: "Optimize Operations",
    icon: Zap,
    description: "Efficiency is crucial for small businesses with limited resources. Streamline processes to do more with less.",
    actionItems: [
      "Automate repetitive tasks with affordable tools",
      "Standardize your processes with SOPs",
      "Regularly review and eliminate unnecessary expenses",
      "Use AI tools to augment your team's capabilities"
    ]
  },
  {
    title: "Diversify Revenue Streams",
    icon: TrendingUp,
    description: "Relying on a single product or customer is risky. Create multiple income sources to build resilience.",
    actionItems: [
      "Add complementary products or services",
      "Create passive income through digital products",
      "Explore subscription or recurring revenue models",
      "Consider licensing or white-labeling your expertise"
    ]
  },
  {
    title: "Manage Cash Flow",
    icon: Wallet,
    description: "Cash flow kills more small businesses than lack of profit. Master your money management to survive and thrive.",
    actionItems: [
      "Invoice promptly and follow up on late payments",
      "Negotiate better terms with suppliers",
      "Keep 3-6 months of operating expenses in reserve",
      "Separate business and personal finances completely"
    ]
  },
  {
    title: "Track Key Metrics",
    icon: BarChart,
    description: "What gets measured gets managed. Know your numbers to make informed decisions.",
    actionItems: [
      "Monitor customer acquisition cost (CAC)",
      "Track customer lifetime value (LTV)",
      "Measure your profit margins by product/service",
      "Review metrics weekly, not just monthly"
    ]
  },
  {
    title: "Scale Strategically",
    icon: Rocket,
    description: "Growth for growth's sake can kill a business. Scale intentionally with a clear plan.",
    actionItems: [
      "Document your processes before hiring",
      "Hire for culture fit and train for skills",
      "Expand to new markets only after dominating current ones",
      "Maintain quality as you grow"
    ]
  }
];

const faqs = [
  {
    question: "What is the best growth strategy for a small business?",
    answer: "The best growth strategy depends on your business type, market, and resources. However, most successful small businesses focus on niche domination, customer retention, and operational efficiency before scaling. Start with what you're already good at and expand from there."
  },
  {
    question: "How can I compete with larger businesses?",
    answer: "Small businesses have advantages big companies don't: agility, personal relationships, and niche focus. Compete by being faster to adapt, providing exceptional customer service, and specializing in areas where big players can't or won't focus."
  },
  {
    question: "How much should I invest in marketing?",
    answer: "Most small businesses should invest 5-10% of revenue in marketing. However, startups might need to invest more (15-20%) initially to build awareness. Start small, measure results, and scale what works."
  },
  {
    question: "How can AI help my small business?",
    answer: "AI tools can help small businesses compete with larger companies by automating tasks, providing market insights, and creating content. Synoptas, for example, uses AI to generate business strategies based on real-time market data, saving you hours of research."
  }
];

const BusinessStrategiesForSmallBusiness = () => {
  return (
    <div className="min-h-screen relative overflow-hidden">
      <SEOHead
        title="Business Strategies for Small Business: 8 Proven Growth Tactics | Synoptas"
        description="Discover proven business strategies for small business growth. Learn how to compete with larger companies, increase sales, and build a sustainable business. Free AI strategy generator included."
        keywords="business strategies for small business, small business growth strategies, how to grow a small business, small business marketing strategies, business strategies to increase sales, small business tips"
        canonical="/business-strategies-for-small-business"
      />
      <BreadcrumbSchema
        items={[
          { name: "Home", url: "https://synoptas.com" },
          { name: "Business Strategies for Small Business", url: "https://synoptas.com/business-strategies-for-small-business" }
        ]}
      />
      
      {/* FAQ Schema */}
      <Helmet>
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
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            "headline": "Business Strategies for Small Business: 8 Proven Growth Tactics",
            "description": "Discover proven business strategies for small business growth.",
            "author": {
              "@type": "Organization",
              "name": "Synoptas"
            },
            "publisher": {
              "@type": "Organization",
              "name": "Synoptas",
              "logo": {
                "@type": "ImageObject",
                "url": "https://synoptas.com/synoptas-favicon.png"
              }
            },
            "datePublished": "2025-01-01",
            "dateModified": new Date().toISOString().split('T')[0]
          })}
        </script>
      </Helmet>

      <Navbar />
      
      <main className="pt-24 pb-16">
        {/* Hero Section */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 mb-16">
          <div className="max-w-4xl mx-auto text-center">
            <span className="inline-block px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              Small Business Growth Guide
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6">
              Business Strategies for <span className="text-primary">Small Business</span>
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              Running a small business is hard. Competing with larger companies with bigger budgets 
              feels impossible. But small businesses have unique advantages – if you know how to use them. 
              Here are 8 proven strategies to help your small business grow sustainably.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="rounded-2xl">
                <Link to="/business-tools">
                  Get Your Custom Strategy <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="rounded-2xl">
                <a href="#strategies">Explore Strategies</a>
              </Button>
            </div>
          </div>
        </section>

        {/* Quick Stats */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 mb-16">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { stat: "99.9%", label: "of US businesses are small businesses" },
                { stat: "47.1%", label: "of US employees work for small businesses" },
                { stat: "5x", label: "cost to acquire vs. retain customers" },
                { stat: "82%", label: "of businesses fail due to cash flow" }
              ].map((item, i) => (
                <Card key={i} className="bg-card/60 backdrop-blur-sm border-border text-center">
                  <CardContent className="p-4">
                    <div className="text-2xl sm:text-3xl font-bold text-primary mb-1">{item.stat}</div>
                    <p className="text-xs text-muted-foreground">{item.label}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Strategies */}
        <section id="strategies" className="container mx-auto px-4 sm:px-6 lg:px-8 mb-16">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4 text-center">
              8 Proven Business Strategies for Growth
            </h2>
            <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
              These strategies aren't theory – they're battle-tested tactics used by successful 
              small businesses around the world. Implement them one at a time for sustainable growth.
            </p>
            
            <div className="grid md:grid-cols-2 gap-6">
              {strategies.map((strategy, index) => (
                <Card key={index} className="bg-card/80 backdrop-blur-sm border-border h-full">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <strategy.icon className="h-6 w-6 text-primary" />
                      </div>
                      <h3 className="text-lg font-bold text-foreground">{strategy.title}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">{strategy.description}</p>
                    <ul className="space-y-2">
                      {strategy.actionItems.map((item, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <CheckCircle className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                          {item}
                        </li>
                      ))}
                    </ul>
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
                  Get a Custom Strategy for Your Business
                </h2>
                <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                  Generic advice only gets you so far. Our AI analyzes your specific business, 
                  industry, and goals to create a personalized growth strategy with actionable steps.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button asChild size="lg" className="rounded-2xl">
                    <Link to="/business-tools">
                      Generate Your Strategy <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="lg" className="rounded-2xl">
                    <Link to="/market-research">Explore Market Research</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Common Mistakes */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 mb-16">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-8 text-center">
              Common Mistakes Small Businesses Make
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              {[
                { mistake: "Trying to appeal to everyone", fix: "Focus on a specific target market and niche." },
                { mistake: "Ignoring cash flow management", fix: "Track cash flow weekly, not just monthly." },
                { mistake: "Competing on price alone", fix: "Compete on value, service, and specialization." },
                { mistake: "Scaling too fast", fix: "Nail your processes before hiring or expanding." },
                { mistake: "Not tracking metrics", fix: "Know your CAC, LTV, and profit margins." },
                { mistake: "Doing everything yourself", fix: "Delegate or automate non-core tasks." }
              ].map((item, i) => (
                <Card key={i} className="bg-card/60 backdrop-blur-sm border-border">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <span className="text-red-500 font-bold">✗</span>
                      <div>
                        <p className="font-medium text-foreground line-through opacity-70">{item.mistake}</p>
                        <p className="text-sm text-primary mt-1">→ {item.fix}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
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
                  <Link to="/how-to-write-a-business-plan" className="block">
                    <h3 className="font-semibold text-foreground mb-2 hover:text-primary transition-colors">
                      How to Write a Business Plan →
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Complete guide to writing a professional business plan.
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
                  <Link to="/pricing" className="block">
                    <h3 className="font-semibold text-foreground mb-2 hover:text-primary transition-colors">
                      Pricing Plans →
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      See our pricing options for AI business tools.
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

export default BusinessStrategiesForSmallBusiness;
