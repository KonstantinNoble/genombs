import demoInput from "@/assets/demo-input.jpeg";
import demoDashboard from "@/assets/demo-dashboard.jpeg";
import demoStrategy from "@/assets/demo-strategy.jpeg";

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

        <div className="grid md:grid-cols-3 gap-8 lg:gap-12 mb-16">
          {/* Step 1 */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <span className="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-primary-foreground font-semibold text-lg">
                1
              </span>
              <h3 className="text-xl font-semibold">Describe Your Goal</h3>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              Enter your business objective with optional context like budget, team size, or industry. The more specific, the better your strategy.
            </p>
            <div className="rounded-lg overflow-hidden shadow-lg border border-border/50">
              <img
                src={demoInput}
                alt="Strategy input form showing goal description fields"
                className="w-full h-auto"
                loading="lazy"
              />
            </div>
          </div>

          {/* Step 2 */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <span className="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-primary-foreground font-semibold text-lg">
                2
              </span>
              <h3 className="text-xl font-semibold">AI Creates Your Strategy</h3>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              Our AI analyzes your input and generates a phased roadmap with weekly actions, realistic budgets, and measurable milestones.
            </p>
            <div className="rounded-lg overflow-hidden shadow-lg border border-border/50">
              <img
                src={demoStrategy}
                alt="Generated strategy with phases and action items"
                className="w-full h-auto"
                loading="lazy"
              />
            </div>
          </div>

          {/* Step 3 */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <span className="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-primary-foreground font-semibold text-lg">
                3
              </span>
              <h3 className="text-xl font-semibold">Track Your Progress</h3>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              Activate your strategy and monitor completion. Mark phases and actions as done to stay on track with your goals.
            </p>
            <div className="rounded-lg overflow-hidden shadow-lg border border-border/50">
              <img
                src={demoDashboard}
                alt="Progress dashboard showing strategy tracking"
                className="w-full h-auto"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
