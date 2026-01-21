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
    answer: "You type a business question. Three AI models – GPT-5, Gemini Pro, and Flash – each think about it separately. Then we show you where they agree and where they don't. Takes about 20 seconds."
  },
  {
    question: "Why would I want three AIs instead of one?",
    answer: "One model gives you one answer. Sounds confident, but how do you know it's right? When three models independently say the same thing, that's a stronger signal. When they disagree, that's useful too – it shows where you should think harder."
  },
  {
    question: "What do 'consensus' and 'dissent' mean here?",
    answer: "Consensus = all three models basically agree. Dissent = they don't. We break it down so you can see exactly which parts of the advice are solid and which parts are up for debate."
  },
  {
    question: "What's the point of the sliders?",
    answer: "They shape the analysis. Risk slider: conservative vs. bold recommendations. Creativity slider: practical ideas vs. more innovative ones. Adjust them to match how you think."
  },
  {
    question: "What kind of questions should I ask?",
    answer: "Real decisions you're actually facing. 'Should I raise prices 20%?' 'Is now the right time to hire?' 'Should I expand to enterprise clients?' Specific questions get the most useful answers."
  },
  {
    question: "How much should I trust this?",
    answer: "When all three models agree, that's usually a solid take. But it's not a crystal ball. Use it as input for your thinking, not as a replacement for it."
  },
  {
    question: "What's the difference between Free and Premium?",
    answer: "Free: 2 checks a day, shorter responses. Premium: 20 checks a day, detailed answers, plus sections you don't get otherwise – competitor context, 6-12 month outlook, and backup strategies if Plan A doesn't work."
  },
  {
    question: "Can I try it without paying?",
    answer: "Yes. 2 free checks per day, no credit card needed. Enough to see if it's useful for you."
  },
  {
    question: "What happens to my questions?",
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
