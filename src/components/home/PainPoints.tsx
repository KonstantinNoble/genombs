import { X } from "lucide-react";

const PainPoints = () => {
  const painPoints = [
    "You've Googled 'how to grow my business' 100 times",
    "ChatGPT gave you generic fluff that didn't help",
    "You have goals but no structured plan to reach them",
    "You're spending hours researching instead of executing",
  ];

  return (
    <section className="py-16 px-4 bg-muted/30 border-y border-border">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-8">
          Sound familiar?
        </h2>

        <div className="grid sm:grid-cols-2 gap-4 mb-10">
          {painPoints.map((point, index) => (
            <div
              key={index}
              className="flex items-center gap-3 bg-destructive/10 border border-destructive/20 rounded-lg p-4 text-left animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <X className="w-5 h-5 text-destructive shrink-0" />
              <span className="text-muted-foreground">{point}</span>
            </div>
          ))}
        </div>

        <div className="inline-flex items-center gap-2 px-6 py-3 bg-primary/10 border border-primary/30 rounded-full animate-fade-in" style={{ animationDelay: "0.5s" }}>
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <span className="text-foreground font-medium">Synoptas fixes this.</span>
        </div>
      </div>
    </section>
  );
};

export default PainPoints;
