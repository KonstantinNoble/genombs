import modelWeightsPreview from "@/assets/model-weights-preview.jpeg";
import validationResultsPreview from "@/assets/validation-results-preview.jpeg";
import teamMembersPreview from "@/assets/team-members-preview.jpeg";

const showcaseItems = [
  {
    step: 1,
    title: "Weight Your AI Advisors",
    description: "Choose your models and control their influence. Some voices matter more – you decide which ones.",
    image: modelWeightsPreview,
    alt: "Synoptas AI model weighting interface for customizing advisor influence"
  },
  {
    step: 2,
    title: "See the Full Picture",
    description: "Get documented perspectives, strategic scenarios, and points of dissent – all cross-validated by multiple AI models.",
    image: validationResultsPreview,
    alt: "Synoptas validation results showing documented perspectives and AI consensus"
  },
  {
    step: 3,
    title: "Organize in Workspaces",
    description: "Keep personal analyses private or collaborate with your team. Switch contexts with one click.",
    image: teamMembersPreview,
    alt: "Synoptas team members interface for workspace collaboration"
  }
];

const ProductShowcase = () => {
  return (
    <div className="w-full max-w-5xl mx-auto px-4">
      {/* Section Header */}
      <div className="text-center mb-12 lg:mb-16">
        <h2 className="text-2xl sm:text-3xl font-semibold text-foreground mb-3">
          How It Works
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          From question to documented decision in three simple steps
        </p>
      </div>

      {/* Vertical Layout */}
      <div className="flex flex-col gap-16 lg:gap-20">
        {showcaseItems.map((item) => (
          <div 
            key={item.step}
            className="flex flex-col items-center"
          >
            {/* Text Content */}
            <div className="mb-6 text-center max-w-2xl">
              <div className="inline-flex items-center gap-3 mb-3">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-semibold">
                  {item.step}
                </span>
                <h3 className="text-xl sm:text-2xl font-semibold text-foreground">
                  {item.title}
                </h3>
              </div>
              <p className="text-muted-foreground text-base sm:text-lg">
                {item.description}
              </p>
            </div>

            {/* Browser Mockup Card */}
            <div className="relative w-full max-w-3xl rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-[1.01]">
              {/* Browser Header */}
              <div className="flex items-center gap-1.5 px-4 py-2.5 bg-muted/30 border-b border-border/50">
                <div className="w-3 h-3 rounded-full bg-red-400/60" />
                <div className="w-3 h-3 rounded-full bg-yellow-400/60" />
                <div className="w-3 h-3 rounded-full bg-green-400/60" />
              </div>

              {/* Screenshot */}
              <div className="relative overflow-hidden">
                <img 
                  src={item.image}
                  alt={item.alt}
                  className="w-full h-auto object-contain"
                  loading="lazy"
                />
                
                {/* Bottom Gradient Fade */}
                <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-card to-transparent" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductShowcase;
