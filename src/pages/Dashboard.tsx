import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

// Dashboard sections
import InsightsSection from "@/components/dashboard/InsightsSection";
import GatewaySection from "@/components/dashboard/GatewaySection";
import OptimizerSection from "@/components/dashboard/OptimizerSection";
import LogsSection from "@/components/dashboard/LogsSection";

type SectionType = "insights" | "gateway" | "optimizer" | "logs";

const navigationItems = [
  {
    id: "insights" as const,
    label: "Insights",
  },
  {
    id: "gateway" as const,
    label: "Gateway",
  },
  {
    id: "optimizer" as const,
    label: "Optimizer",
  },
  {
    id: "logs" as const,
    label: "Logs",
  },
];

const Dashboard = () => {
  const [activeSection, setActiveSection] = useState<SectionType>("insights");

  const renderSection = () => {
    switch (activeSection) {
      case "insights":
        return <InsightsSection />;
      case "gateway":
        return <GatewaySection />;
      case "optimizer":
        return <OptimizerSection />;
      case "logs":
        return <LogsSection />;
      default:
        return <InsightsSection />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/40 bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-8">
              <Link to="/" className="text-xl font-semibold tracking-tight">
                Synvertas
              </Link>
              <nav className="hidden md:flex items-center">
                {navigationItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveSection(item.id)}
                    className={`px-4 py-2 text-sm font-medium transition-colors relative ${
                      activeSection === item.id
                        ? "text-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {item.label}
                    {activeSection === item.id && (
                      <span className="absolute bottom-0 left-4 right-4 h-0.5 bg-primary rounded-full" />
                    )}
                  </button>
                ))}
              </nav>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link to="/">Back to Home</Link>
            </Button>
          </div>

          {/* Mobile Navigation */}
          <nav className="flex md:hidden items-center gap-1 mt-4 -mx-2 overflow-x-auto pb-2">
            {navigationItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`px-4 py-2 text-sm font-medium rounded-full transition-colors whitespace-nowrap ${
                  activeSection === item.id
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {renderSection()}
      </main>
    </div>
  );
};

export default Dashboard;
