import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface AnalysisLoaderProps {
  isDeepMode: boolean;
}

const standardSteps = [
  "Analyzing your business goals...",
  "Identifying key opportunities...",
  "Creating strategic phases...",
  "Generating actionable steps...",
];

const deepSteps = [
  "Analyzing your business goals...",
  "Researching market opportunities...",
  "Analyzing competitive landscape...",
  "Creating strategic phases...",
  "Calculating budgets and timelines...",
  "Generating detailed recommendations...",
];

export function AnalysisLoader({ isDeepMode }: AnalysisLoaderProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  
  const steps = isDeepMode ? deepSteps : standardSteps;

  useEffect(() => {
    const stepInterval = setInterval(() => {
      setCurrentStep((prev) => (prev + 1) % steps.length);
    }, 3500);

    return () => clearInterval(stepInterval);
  }, [steps.length]);

  useEffect(() => {
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 95) return 15;
        return prev + Math.random() * 8 + 2;
      });
    }, 400);

    return () => clearInterval(progressInterval);
  }, []);

  return (
    <Card className={`border-primary/20 shadow-elegant overflow-hidden ${isDeepMode ? 'ring-1 ring-amber-500/20' : ''}`}>
      <div className={`h-1 ${isDeepMode ? 'bg-gradient-to-r from-amber-500/30 to-yellow-500/30' : 'bg-primary/10'}`} />
      <CardContent className="py-12 px-6">
        <div className="max-w-md mx-auto space-y-8">
          <div className="text-center space-y-2">
            <h3 className="text-xl font-semibold text-foreground">
              {isDeepMode ? "Deep Analysis in Progress" : "Creating Your Strategy"}
            </h3>
            <p className="text-sm text-muted-foreground">
              This usually takes {isDeepMode ? "20-40" : "15-25"} seconds
            </p>
          </div>

          <div className="space-y-3">
            <Progress 
              value={progress} 
              className={`h-2 ${isDeepMode ? '[&>div]:bg-gradient-to-r [&>div]:from-amber-500 [&>div]:to-yellow-500' : ''}`}
            />
            <p 
              key={currentStep}
              className="text-center text-sm font-medium text-muted-foreground animate-fade-in"
            >
              {steps[currentStep]}
            </p>
          </div>

          <div className="flex justify-center gap-2">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`h-1.5 w-1.5 rounded-full transition-all duration-300 ${
                  index === currentStep 
                    ? isDeepMode ? 'bg-amber-500 scale-125' : 'bg-primary scale-125'
                    : 'bg-muted-foreground/30'
                }`}
              />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
