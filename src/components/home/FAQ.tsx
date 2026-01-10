import { Card, CardContent } from "@/components/ui/card";
import { FAQSchema } from "@/components/seo/StructuredData";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "What is an AI business plan generator?",
    answer: "An AI business plan generator is a tool that uses artificial intelligence to create customized business strategies based on your goals, industry, and market data. Unlike generic templates, it analyzes real-time market information to provide actionable, data-driven recommendations tailored to your specific situation."
  },
  {
    question: "How does Synoptas differ from ChatGPT?",
    answer: "While ChatGPT provides general advice, Synoptas is purpose-built for business strategy. We integrate real-time market research from 20+ sources, provide structured action plans with specific tools and timelines, and offer AI Autopilot to track your progress. It's the difference between getting advice and getting a roadmap."
  },
  {
    question: "How do I write a business plan?",
    answer: "A business plan typically includes an executive summary, company description, market analysis, organization structure, product/service details, marketing strategy, and financial projections. With Synoptas, you simply describe your business goals and our AI generates a comprehensive, phased strategy – saving you hours of research and writing."
  },
  {
    question: "Is Synoptas suitable for small business owners?",
    answer: "Absolutely! Synoptas is designed specifically for solopreneurs, small business owners, and growing companies. Our AI creates strategies that are practical and achievable, not theoretical frameworks that only work for large corporations with massive budgets."
  },
  {
    question: "What business strategies work best for growth?",
    answer: "The best growth strategies depend on your business stage and market. However, common effective approaches include niche focus, customer retention, digital marketing optimization, and operational efficiency. Synoptas analyzes your specific situation to recommend strategies that will have the highest impact for your business."
  },
  {
    question: "How accurate is the market research?",
    answer: "Our market research is powered by Perplexity AI, which aggregates data from 20+ authoritative sources in real-time. Premium users get enhanced analysis with more detailed insights. While no AI is perfect, our data provides a solid foundation for strategic decision-making."
  },
  {
    question: "Can I download my business plan as a PDF?",
    answer: "Yes! All users can generate PDF exports of their strategies. These professional documents are perfect for sharing with investors, partners, or team members. Premium users get enhanced PDF reports with additional data and visualizations."
  },
  {
    question: "What is AI Autopilot?",
    answer: "AI Autopilot is our unique feature that breaks your strategy into daily focus tasks. Instead of an overwhelming 50-page plan, you get 3-5 prioritized tasks each day that keep you moving toward your goals. Premium users get unlimited daily task generations."
  },
  {
    question: "Is my data secure?",
    answer: "Yes, we take security seriously. Your data is encrypted, processed server-side to protect your IP, and automatically deleted after 30 days of inactivity. We never share your business information with third parties. See our Privacy Policy for full details."
  },
  {
    question: "Can I cancel my subscription anytime?",
    answer: "Yes, you can cancel your premium subscription at any time. You'll retain access to premium features until the end of your billing period. No questions asked, no hidden fees."
  }
];

const FAQ = () => {
  return (
    <section className="py-16 sm:py-24 bg-background/50">
      <FAQSchema faqs={faqs} />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-muted-foreground">
            Everything you need to know about AI business planning and Synoptas
          </p>
        </div>
        
        <div className="max-w-3xl mx-auto">
          <Card className="bg-card/80 backdrop-blur-sm border-border">
            <CardContent className="p-6">
              <Accordion type="single" collapsible className="w-full">
                {faqs.map((faq, index) => (
                  <AccordionItem key={index} value={`item-${index}`}>
                    <AccordionTrigger className="text-left text-foreground hover:text-primary">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default FAQ;
