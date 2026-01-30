import analysisPreview from "@/assets/analysis-preview.jpeg";

const ProductShowcase = () => {
  return (
    <div className="w-full max-w-5xl mx-auto px-4">
      {/* Browser Mockup Container */}
      <div className="relative rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm shadow-2xl overflow-hidden">
        {/* Browser Header */}
        <div className="flex items-center gap-2 px-4 py-3 bg-muted/30 border-b border-border/50">
          {/* Window Controls */}
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-400/60" />
            <div className="w-3 h-3 rounded-full bg-yellow-400/60" />
            <div className="w-3 h-3 rounded-full bg-green-400/60" />
          </div>
          
          {/* Address Bar */}
          <div className="flex-1 flex justify-center">
            <div className="flex items-center gap-2 px-4 py-1.5 bg-background/50 rounded-lg text-xs text-muted-foreground">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <span>synoptas.com/validate</span>
            </div>
          </div>
          
          {/* Spacer for symmetry */}
          <div className="w-[52px]" />
        </div>

        {/* Screenshot Container */}
        <div className="relative overflow-hidden">
          {/* Badge */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10">
            <span className="px-4 py-1.5 bg-primary/90 text-primary-foreground text-xs font-medium rounded-full shadow-lg backdrop-blur-sm">
              Live Analysis Preview
            </span>
          </div>
          
          {/* Screenshot Image */}
          <img 
            src={analysisPreview}
            alt="Synoptas analysis showing AI consensus and dissent for business decisions"
            className="w-full h-[280px] sm:h-[380px] md:h-[480px] lg:h-[540px] object-cover object-top"
            loading="eager"
          />
          
          {/* Bottom Gradient Fade */}
          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-card to-transparent" />
        </div>
      </div>
      
      {/* Caption */}
      <p className="text-center text-sm text-muted-foreground mt-6">
        See how multiple AI perspectives help you make better decisions
      </p>
    </div>
  );
};

export default ProductShowcase;
