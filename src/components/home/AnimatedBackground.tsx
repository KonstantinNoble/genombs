import React from "react";

const AnimatedBackground: React.FC = () => {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <span className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-primary/25 blur-3xl animate-blob" />
      <span className="absolute top-1/3 -right-16 h-80 w-80 rounded-full bg-accent/20 blur-3xl animate-blob animation-delay-2000" />
      <span className="absolute bottom-[-4rem] left-1/4 h-72 w-72 rounded-full bg-secondary/30 blur-3xl animate-blob animation-delay-4000" />
    </div>
  );
};

export default AnimatedBackground;
