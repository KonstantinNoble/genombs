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
    question: "What exactly does Synoptas do?",
    answer: "You describe a decision. Three AI models analyze it independently and document their perspectives. We show you where they agree, where they disagree, and what alternatives exist. You get an exportable audit record in under 60 seconds."
  },
  {
    question: "Why three AI models instead of one?",
    answer: "One model gives you one perspective with no way to verify it. Three models give you documented consensus (strong signal), documented dissent (needs attention), and a complete picture you can defend to stakeholders."
  },
  {
    question: "What do 'consensus' and 'dissent' mean?",
    answer: "Consensus means all three models reached the same conclusion – a strong signal you're on the right track. Dissent means they disagree – these are the areas where you should dig deeper before deciding."
  },
  {
    question: "How do the model weighting sliders work?",
    answer: "Each model can be weighted from 10% to 80% influence on the final synthesis. Adjust weights based on which perspective matters most for your specific decision context."
  },
  {
    question: "What kinds of decisions should I document?",
    answer: "Any decision you might need to justify later: investment decisions, strategic pivots, major hires, pricing changes, vendor selections. The higher the stakes, the more valuable the documentation."
  },
  {
    question: "How reliable is the analysis?",
    answer: "Synoptas documents perspectives – it doesn't make decisions for you. The value is in having a traceable record that shows you considered multiple viewpoints before committing. The final decision is always yours."
  },
  {
    question: "What's the difference between Free and Premium?",
    answer: "Free: 2 decision records per day with core documentation. Premium ($26.99/mo): 10 records per day, full audit trail, competitor context, 6-12 month outlook, strategic alternatives, and stakeholder-ready PDF exports."
  },
  {
    question: "Can I try it before paying?",
    answer: "Yes. 2 free decision records per day, no credit card required. Enough to see whether documented decisions work for your process."
  },
  {
    question: "What happens to my decision records?",
    answer: "Your records are private and encrypted. We never share them. Delete your account and we delete all your data. See our privacy policy for details."
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
