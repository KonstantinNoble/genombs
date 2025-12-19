const HowItWorks = () => {
  return (
    <section className="py-20 sm:py-28 bg-muted/30" id="how-it-works">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            How It Works
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            From goal to action plan in three simple steps
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
          {/* Step 1 */}
          <div className="relative p-8 rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm">
            <span className="absolute -top-5 left-8 flex items-center justify-center w-10 h-10 rounded-full bg-primary text-primary-foreground font-semibold text-lg">
              1
            </span>
            <h3 className="text-xl font-semibold mt-2 mb-4">Describe Your Goal</h3>
            <p className="text-muted-foreground leading-relaxed">
              Enter your business objective. Add your website URL for personalized insights, plus optional context like budget, team size, or industry.
            </p>
          </div>

          {/* Step 2 */}
          <div className="relative p-8 rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm">
            <span className="absolute -top-5 left-8 flex items-center justify-center w-10 h-10 rounded-full bg-primary text-primary-foreground font-semibold text-lg">
              2
            </span>
            <h3 className="text-xl font-semibold mt-2 mb-4">AI Creates Your Strategy</h3>
            <p className="text-muted-foreground leading-relaxed">
              Our AI analyzes your input and generates a phased roadmap with weekly actions, realistic budgets, and measurable milestones.
            </p>
          </div>

          {/* Step 3 */}
          <div className="relative p-8 rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm">
            <span className="absolute -top-5 left-8 flex items-center justify-center w-10 h-10 rounded-full bg-primary text-primary-foreground font-semibold text-lg">
              3
            </span>
            <h3 className="text-xl font-semibold mt-2 mb-4">Track Your Progress</h3>
            <p className="text-muted-foreground leading-relaxed">
              Activate your strategy and monitor completion. Mark phases and actions as done to stay on track with your goals.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
