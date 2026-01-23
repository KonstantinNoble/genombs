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
    question: "So what is this, exactly?",
    answer: "You describe a decision. Three AI models document different perspectives. We show where they agree, where they disagree, and give you an exportable record. Takes about 20 seconds."
  },
  {
    question: "Why would I want three AIs instead of one?",
    answer: "One model gives you one perspective – undocumented. With three, you get documented consensus, documented dissent, and a complete picture you can show to stakeholders."
  },
  {
    question: "What do 'consensus' and 'dissent' mean here?",
    answer: "Consensus = all three models document the same perspective. Dissent = they document different viewpoints. This shows which aspects have broad agreement and which require deeper consideration."
  },
  {
    question: "What's the point of the sliders?",
    answer: "They shape the perspective weighting. Adjust how much each model's documented view influences the summary. Match it to your decision context."
  },
  {
    question: "What kind of decisions should I document?",
    answer: "Important decisions you need to justify later. Investment decisions, strategic pivots, hiring choices, pricing changes. The more consequential, the more valuable the documentation."
  },
  {
    question: "How much should I trust this?",
    answer: "Synoptas documents perspectives – it doesn't make decisions. You decide. We help you prove you considered multiple viewpoints before deciding."
  },
  {
    question: "What's the difference between Free and Premium?",
    answer: "Free: 2 decision records per day, basic documentation. Premium: 10 records per day, full audit trail, competitor context, 6-12 month outlook, and PDF export for stakeholder-ready reports."
  },
  {
    question: "Can I try it without paying?",
    answer: "Yes. 2 free decision records per day, no credit card needed. Enough to see if documented decisions help you."
  },
  {
    question: "What happens to my decision records?",
    answer: "They're private. We don't share them with anyone. Everything's encrypted. Delete your account and we delete your data. Full details in the privacy policy."
  },
  {
    question: "Can I cancel anytime?",
    answer: "Yep. Cancel whenever, keep access until your billing period ends. No hoops, no guilt trips."
  }
];

const FAQ = () => {
  return (
    <section className="py-16 sm:py-24 bg-background/50">
      <FAQSchema faqs={faqs} />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Common Questions
          </h2>
          <p className="text-muted-foreground">
            What people ask before they try it
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
