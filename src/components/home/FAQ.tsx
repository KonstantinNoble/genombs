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
    question: "What is multi-AI validation?",
    answer: "Multi-AI validation queries 3 leading AI models (GPT-5.2, Gemini 3 Pro, Gemini 2.5 Flash) in parallel to analyze your business question. Instead of relying on a single AI's perspective, you get validated recommendations where models agree, and see where they disagree – giving you confidence scores for every insight."
  },
  {
    question: "Which AI models does Synoptas use?",
    answer: "Synoptas uses three cutting-edge models: GPT-5.2 for deep reasoning and nuanced analysis, Gemini 3 Pro for creative strategic thinking, and Gemini 2.5 Flash for pragmatic, execution-focused recommendations. Each brings unique strengths to your business questions."
  },
  {
    question: "What is consensus vs. dissent analysis?",
    answer: "Consensus points are recommendations where all 3 AI models agree – these are high-confidence insights you can act on immediately. Dissent points show where models disagree, revealing risks, nuances, or alternative perspectives worth considering before making decisions."
  },
  {
    question: "How does the risk tolerance slider work?",
    answer: "The risk tolerance slider influences how models weigh their recommendations. Conservative settings prioritize proven, lower-risk approaches. Aggressive settings explore bolder strategies with higher potential returns. The synthesis adapts to match your business philosophy."
  },
  {
    question: "Is Synoptas suitable for business decisions?",
    answer: "Absolutely! Synoptas is designed for strategic business decisions – from pricing strategies and market expansion to product launches and competitive positioning. The multi-model approach is particularly valuable when stakes are high and you need validated perspectives."
  },
  {
    question: "How accurate are the AI recommendations?",
    answer: "The multi-model approach significantly increases reliability compared to single-AI tools. When 3 independent models reach the same conclusion, confidence is high. Dissent analysis helps you identify areas requiring deeper research. However, AI recommendations should complement, not replace, your business judgment."
  },
  {
    question: "What's the difference between Free and Premium?",
    answer: "Free users get 2 validations per day with 2-3 recommendations per model. Premium users ($14.99/mo) get 20 daily validations, 4-5 recommendations per model, 5-7 action items, plus exclusive sections: Strategic Alternatives, Long-term Outlook, and Competitor Insights."
  },
  {
    question: "How fast are the results?",
    answer: "Results typically arrive in about 20 seconds. All 3 models run in parallel, and you see each model's response as it completes. The meta-evaluation synthesizes everything into consensus, majority, and dissent points with a final recommendation."
  },
  {
    question: "Is my data secure?",
    answer: "Yes, we take security seriously. Your data is encrypted, processed server-side, and we're fully GDPR compliant. When you delete your account, all associated data is permanently removed. We never share your business questions with third parties. See our Privacy Policy for details."
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
            Everything you need to know about multi-AI validation and Synoptas
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
