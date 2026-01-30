import analysisPreview from "@/assets/analysis-preview.jpeg";
import inputPreview from "@/assets/input-preview.jpeg";
import workspacesPreview from "@/assets/workspaces-preview.jpeg";

const showcaseItems = [
  {
    step: 1,
    title: "Describe Your Challenge",
    description: "No templates, no complexity. Just explain what you're facing in plain language.",
    image: inputPreview,
    alt: "Synoptas input area for describing your business decision"
  },
  {
    step: 2,
    title: "Get Multiple Perspectives",
    description: "Six AI models debate your decision. See where they agree – and where they don't.",
    image: analysisPreview,
    alt: "Synoptas analysis showing AI consensus and dissent for business decisions"
  },
  {
    step: 3,
    title: "Build Your Decision Record",
    description: "Share insights with your team. Create an auditable trail for investors.",
    image: workspacesPreview,
    alt: "Synoptas team workspaces for collaborative decision-making"
  }
];

const ProductShowcase = () => {
  return (
    <div className="w-full max-w-7xl mx-auto px-4">
      {/* Section Header */}
      <div className="text-center mb-12">
        <h2 className="text-2xl sm:text-3xl font-semibold text-foreground mb-3">
          How It Works
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          From question to documented decision in three simple steps
        </p>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
        {showcaseItems.map((item) => (
          <div 
            key={item.step}
            className="group flex flex-col"
          >
            {/* Text Content */}
            <div className="mb-4 text-center md:text-left">
              <div className="inline-flex items-center gap-2 mb-2">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-semibold">
                  {item.step}
                </span>
                <h3 className="text-lg font-semibold text-foreground">
                  {item.title}
                </h3>
              </div>
              <p className="text-sm text-muted-foreground">
                {item.description}
              </p>
            </div>

            {/* Browser Mockup Card */}
            <div className="relative rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm shadow-lg overflow-hidden transition-all duration-300 group-hover:shadow-xl group-hover:scale-[1.02]">
              {/* Browser Header */}
              <div className="flex items-center gap-1.5 px-3 py-2 bg-muted/30 border-b border-border/50">
                <div className="w-2.5 h-2.5 rounded-full bg-red-400/60" />
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-400/60" />
                <div className="w-2.5 h-2.5 rounded-full bg-green-400/60" />
              </div>

              {/* Screenshot */}
              <div className="relative overflow-hidden">
                <img 
                  src={item.image}
                  alt={item.alt}
                  className="w-full h-[180px] sm:h-[200px] lg:h-[240px] object-cover object-top"
                  loading="lazy"
                />
                
                {/* Bottom Gradient Fade */}
                <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-card to-transparent" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductShowcase;
