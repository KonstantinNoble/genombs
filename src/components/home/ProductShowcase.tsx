import { useState } from "react";
import analysisPreview from "@/assets/analysis-preview.jpeg";
import inputPreview from "@/assets/input-preview.jpeg";
import workspacesPreview from "@/assets/workspaces-preview.jpeg";

const tabs = [
  {
    id: "analysis",
    label: "Analysis Results",
    image: analysisPreview,
    alt: "Synoptas analysis showing AI consensus and dissent for business decisions",
    badge: "See Your Results",
    caption: "Multiple AI perspectives synthesized into actionable insights"
  },
  {
    id: "input",
    label: "Ask Anything",
    image: inputPreview,
    alt: "Synoptas input area for describing your business decision",
    badge: "Simple Input",
    caption: "Describe your challenge in plain language – no complex setup"
  },
  {
    id: "teams",
    label: "Team Workspaces",
    image: workspacesPreview,
    alt: "Synoptas team workspaces for collaborative decision-making",
    badge: "Collaborate",
    caption: "Share decisions with your team and build an auditable record"
  }
];

const ProductShowcase = () => {
  const [activeTab, setActiveTab] = useState("analysis");
  const activeContent = tabs.find(tab => tab.id === activeTab) || tabs[0];

  return (
    <div className="w-full max-w-5xl mx-auto px-4">
      {/* Tab Navigation */}
      <div className="flex items-center justify-center gap-2 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 text-sm font-medium rounded-xl transition-all duration-300 ${
              activeTab === tab.id
                ? "bg-primary text-primary-foreground shadow-md"
                : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

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
              <span>synoptas.com</span>
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
              {activeContent.badge}
            </span>
          </div>
          
          {/* Screenshot Image with transition */}
          <img 
            key={activeContent.id}
            src={activeContent.image}
            alt={activeContent.alt}
            className="w-full h-[280px] sm:h-[380px] md:h-[480px] lg:h-[540px] object-cover object-top transition-opacity duration-300"
            loading="eager"
          />
          
          {/* Bottom Gradient Fade */}
          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-card to-transparent" />
        </div>
      </div>
      
      {/* Caption */}
      <p className="text-center text-sm text-muted-foreground mt-6 transition-opacity duration-300">
        {activeContent.caption}
      </p>
    </div>
  );
};

export default ProductShowcase;
