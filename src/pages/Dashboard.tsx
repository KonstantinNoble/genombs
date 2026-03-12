import { useState } from "react";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import {
  BarChart3,
  Settings,
  Sliders,
  ScrollText,
  Zap,
} from "lucide-react";

import logo from "@/assets/synvertas-logo.png";

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
    icon: BarChart3,
    description: "Dashboard & KPIs",
  },
  {
    id: "gateway" as const,
    label: "Gateway",
    icon: Settings,
    description: "Setup & API Keys",
  },
  {
    id: "optimizer" as const,
    label: "Optimizer",
    icon: Sliders,
    description: "Rules & Routing",
  },
  {
    id: "logs" as const,
    label: "Logs",
    icon: ScrollText,
    description: "Request Explorer",
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
    <SidebarProvider defaultOpen={true}>
      <Sidebar variant="sidebar" collapsible="icon">
        <SidebarHeader className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 overflow-hidden rounded-lg shrink-0">
              <img
                src={logo}
                alt="Synvertas Logo"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex flex-col group-data-[collapsible=icon]:hidden">
              <span className="text-sm font-semibold text-foreground">
                Synvertas
              </span>
              <span className="text-xs text-muted-foreground">AI Gateway</span>
            </div>
          </div>
        </SidebarHeader>

        <Separator className="mx-2" />

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Navigation</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {navigationItems.map((item) => (
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton
                      isActive={activeSection === item.id}
                      onClick={() => setActiveSection(item.id)}
                      tooltip={item.label}
                    >
                      <item.icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <div className="mt-auto p-4 group-data-[collapsible=icon]:hidden">
          <div className="rounded-lg bg-primary/10 border border-primary/20 p-3">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-4 h-4 text-primary" />
              <span className="text-xs font-medium text-primary">Pro Tip</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Increase cache similarity to 95%+ for maximum savings on repetitive queries.
            </p>
          </div>
        </div>
      </Sidebar>

      <SidebarInset>
        <header className="flex h-14 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="h-4" />
          <div className="flex items-center gap-2">
            <h1 className="text-sm font-medium">
              {navigationItems.find((item) => item.id === activeSection)?.label}
            </h1>
            <span className="text-xs text-muted-foreground">
              {navigationItems.find((item) => item.id === activeSection)?.description}
            </span>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-6">
          {renderSection()}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default Dashboard;
