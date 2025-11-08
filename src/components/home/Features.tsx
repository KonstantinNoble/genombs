import { Card, CardContent } from "@/components/ui/card";

const features = [
  {
    title: "Website-Tools Empfehlungen",
    description: "KI-gestützte Analyse deiner Website mit maßgeschneiderten Tool-Vorschlägen zur Optimierung.",
  },
  {
    title: "Website-Geschäftsideen",
    description: "Innovative Geschäftsmodelle und Monetarisierungsstrategien speziell für deine Website.",
  },
  {
    title: "Screenshot-Analyse",
    description: "Lade Screenshots deiner Website hoch - die KI analysiert Design, Struktur und Optimierungspotenzial.",
  },
  {
    title: "Website-Typ spezifisch",
    description: "Empfehlungen basierend auf deinem Website-Typ - E-Commerce, Blog, SaaS, Portfolio oder mehr.",
  },
  {
    title: "Budget-orientiert",
    description: "Tool- und Ideen-Vorschläge passend zu deinem monatlichen Budget und Website-Status.",
  },
  {
    title: "Sofortige Ergebnisse",
    description: "Detaillierte Analyse mit konkreten Handlungsempfehlungen in Sekunden.",
  },
];

const Features = () => {
  return (
    <section
      className="py-20 sm:py-24 md:py-32 bg-background"
      aria-label="Features section"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 space-y-4 animate-fade-in">
          <h2 className="text-4xl sm:text-5xl font-bold text-foreground">
            Dein AI Website Advisor
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Zwei leistungsstarke KI-Funktionen: Finde die perfekten Tools für deine Website und entdecke profitable Geschäftsideen - alles auf Basis deiner Website-Screenshots und -Ziele.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="p-6 transition-all duration-500 hover:shadow-xl hover:-translate-y-1 hover:border-primary/50 border-border bg-card group animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <h3 className="text-xl font-semibold mb-3 text-foreground group-hover:text-primary transition-all duration-500">
                {feature.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
