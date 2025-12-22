import { useScrollReveal } from "@/hooks/useScrollReveal";

const ProductShowcase = () => {
  const { ref: revealRef, isVisible } = useScrollReveal();
  const screenshots = [
    {
      src: "/screenshots/homepage.png",
      alt: "Synoptas Homepage - Modern Business Strategy Platform",
      title: "Modernes Interface",
      description: "Klares Design für fokussierte Arbeit",
    },
    {
      src: "/screenshots/pricing.png",
      alt: "Synoptas Pricing - Flexible Pläne",
      title: "Faire Preise",
      description: "Starte kostenlos, upgrade wenn du bereit bist",
      featured: true,
    },
    {
      src: "/screenshots/ideas.png",
      alt: "Business Ideas Community",
      title: "Community Features",
      description: "Teile Ideen & erhalte Feedback",
    },
  ];

  return (
    <section 
      ref={revealRef as React.RefObject<HTMLElement>}
      className={`py-20 bg-muted/30 relative overflow-hidden transition-opacity duration-700 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
    >
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent pointer-events-none" />
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="text-center mb-12">
          <span className="inline-block px-4 py-1.5 mb-4 text-sm font-medium border border-border/40 rounded-full bg-background/50 backdrop-blur-sm">
            Live Preview
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Erlebe <span className="text-primary">Synoptas</span> in Aktion
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Echte Screenshots unserer Plattform — so sieht dein Business-Erfolg aus.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {screenshots.map((screenshot, index) => (
            <div
              key={index}
              className={`group relative rounded-xl overflow-hidden border border-border/40 bg-card/50 backdrop-blur-sm shadow-lg transition-all duration-300 hover:shadow-xl hover:shadow-primary/10 hover:border-primary/30 ${
                screenshot.featured ? 'lg:row-span-2' : ''
              }`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Screenshot Image */}
              <div className={`relative overflow-hidden ${screenshot.featured ? 'aspect-[4/5]' : 'aspect-video'}`}>
                <img
                  src={screenshot.src}
                  alt={screenshot.alt}
                  className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
                {/* Overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
              
              {/* Content */}
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-background via-background/95 to-transparent">
                <h3 className="font-semibold text-foreground mb-1">
                  {screenshot.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {screenshot.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Trust Indicator */}
        <p className="text-center mt-8 text-sm text-muted-foreground">
          ✓ Echte Screenshots • ✓ Keine Mock-ups • ✓ Was du siehst, bekommst du
        </p>
      </div>
    </section>
  );
};

export default ProductShowcase;
