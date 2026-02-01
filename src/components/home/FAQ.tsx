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
    question: "Is this for solo founders?",
    answer: "Absolutely. Synoptas was built for founders who don't have a co-founder or board to challenge their thinking. It's your structured second opinion – multiple AI perspectives before you commit to big decisions."
  },
  {
    question: "How is this different from just asking ChatGPT?",
    answer: "ChatGPT gives you one answer with no way to verify it. Synoptas shows you where 3 different AI perspectives agree (strong signal) or disagree (dig deeper), weighted by what matters to you. Plus, you get a documented history of your thinking process."
  },
  {
    question: "What do 'consensus' and 'dissent' mean?",
    answer: "Consensus means all three models reached the same conclusion – a strong signal you're on the right track. Dissent means they disagree – these are the areas where you should dig deeper before deciding."
  },
  {
    question: "Can I share analyses with my co-founder or team?",
    answer: "Yes. Premium subscribers can create up to 5 team workspaces with up to 5 members each. Build a shared history of how your team thinks and decides. Only one subscription needed per team."
  },
  {
    question: "What's the difference between Free and Premium?",
    answer: "Free: 2 analyses per day with core insights and basic business context. Premium ($26.99/mo): 10 analyses per day, website auto-scanning, team workspaces, and investor-ready PDF exports."
  },
  {
    question: "Can I try it before paying?",
    answer: "Yes. 2 free analyses per day, no credit card required. Enough to see whether a structured second opinion helps your decision-making."
  },
  {
    question: "Can I cancel anytime?",
    answer: "Yes. Cancel whenever you want and keep access until your billing period ends. No cancellation fees, no questions asked."
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
            Everything you need to know before getting started
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
