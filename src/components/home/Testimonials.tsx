import { useScrollReveal } from "@/hooks/useScrollReveal";
import { Quote } from "lucide-react";

interface TestimonialProps {
  quote: string;
  name: string;
  role: string;
  index: number;
}

const TestimonialCard = ({ quote, name, role, index }: TestimonialProps) => {
  const { ref, isVisible } = useScrollReveal();

  return (
    <div
      ref={ref}
      className={`group relative rounded-2xl p-6 md:p-8 bg-card/50 border border-border/60 card-hover-subtle scroll-reveal ${isVisible ? 'revealed' : ''}`}
      style={{ transitionDelay: `${index * 0.1}s` }}
    >
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-primary/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
      
      <div className="relative">
        <Quote className="w-8 h-8 text-primary/30 mb-4" />
        <p className="text-foreground leading-relaxed mb-6 italic">
          "{quote}"
        </p>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
            <span className="text-sm font-semibold text-muted-foreground">
              {name.split(' ').map(n => n[0]).join('')}
            </span>
          </div>
          <div>
            <p className="font-semibold text-foreground text-sm">{name}</p>
            <p className="text-xs text-muted-foreground">{role}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const Testimonials = () => {
  const { ref: headerRef, isVisible: headerVisible } = useScrollReveal();

  const testimonials = [
    {
      quote: "Was about to hire a $180k engineer. Ran it through Synoptas first - 2 of 3 models flagged runway concerns. Waited 3 months. Smart move.",
      name: "Marcus Reinholt",
      role: "SaaS Founder"
    },
    {
      quote: "Ran our pricing change through it before launch. Two models agreed, one had concerns. That dissent made me reconsider the timing.",
      name: "Elena Kowalski",
      role: "E-Commerce CEO"
    },
    {
      quote: "My advisor saw the PDF export and said 'This is exactly how you should present decisions to investors.' Using it for every board meeting now.",
      name: "David Chen",
      role: "HealthTech Founder"
    },
    {
      quote: "Before every investor call, I run my key points through Synoptas. Helps me spot weak arguments before they do.",
      name: "Sofia Martinez",
      role: "FinTech Founder"
    }
  ];

  return (
    <section className="py-24 sm:py-28 md:py-36 relative overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div 
          ref={headerRef} 
          className={`text-center max-w-3xl mx-auto mb-20 scroll-reveal ${headerVisible ? 'revealed' : ''}`}
        >
          <span className="text-subtitle tracking-widest text-primary/80 mb-4 block">Testimonials</span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
            What Founders Say
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Real decisions, real impact
          </p>
          <div className="mt-6 mx-auto w-16 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
        </div>

        <div className="grid sm:grid-cols-2 gap-5 lg:gap-6 max-w-4xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <TestimonialCard
              key={index}
              quote={testimonial.quote}
              name={testimonial.name}
              role={testimonial.role}
              index={index}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
