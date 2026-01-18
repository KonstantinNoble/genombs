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
    question: "What does this actually do?",
    answer: "You type in a business question. Three AI models (GPT-5, Gemini Pro, Gemini Flash) each analyze it separately. Then we show you where they agree and where they don't. Takes about 20 seconds."
  },
  {
    question: "Why three models instead of one?",
    answer: "One model gives you one opinion. But how do you know if it's right? When three models independently reach the same conclusion, you can be more confident. When they disagree, that tells you something too – maybe that question needs more thought."
  },
  {
    question: "What's 'consensus' and 'dissent'?",
    answer: "Consensus is when all three models say basically the same thing. Dissent is when they disagree. We break it down so you can see exactly where they align and where they see things differently."
  },
  {
    question: "What are the sliders for?",
    answer: "They let you adjust how the analysis works. The risk slider changes whether you get conservative or bold recommendations. The creativity slider shifts between practical suggestions and more innovative ideas."
  },
  {
    question: "What kind of questions work best?",
    answer: "Business decisions you're actually facing. 'Should I raise my prices?' 'Is it time to hire?' 'Should I expand to a new market?' The more specific you are, the better the answers."
  },
  {
    question: "How accurate is this?",
    answer: "When three AI models agree on something, it's usually a solid take. But this isn't a magic 8-ball. Use it as input for your decisions, not as a replacement for your own judgment."
  },
  {
    question: "What's the difference between free and paid?",
    answer: "Free gets you 2 checks per day with shorter responses. Premium ($14.99/month) gives you 20 per day, longer answers, and extra sections like competitor insights and long-term outlook."
  },
  {
    question: "Can I try before paying?",
    answer: "Yes. The free tier gives you 2 validations per day, no credit card needed. Enough to see if it's useful for you."
  },
  {
    question: "Is my data private?",
    answer: "Yes. We don't share your questions with anyone. Everything is encrypted. If you delete your account, we delete everything. Details are in our privacy policy."
  },
  {
    question: "Can I cancel anytime?",
    answer: "Yes. Cancel whenever you want, you keep access until your billing period ends. No tricks, no questions."
  }
];

const FAQ = () => {
  return (
    <section className="py-16 sm:py-24 bg-background/50">
      <FAQSchema faqs={faqs} />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Questions
          </h2>
          <p className="text-muted-foreground">
            The stuff people usually want to know
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
