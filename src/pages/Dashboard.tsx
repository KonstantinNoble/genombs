import { useState } from "react";
import { Link } from "react-router-dom";
import { MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WebsiteGrid from "@/components/dashboard/WebsiteGrid";
import ComparisonTable from "@/components/dashboard/ComparisonTable";
import TaskBoard from "@/components/dashboard/TaskBoard";
import { mockWebsiteProfiles, mockTasks } from "@/lib/mock-chat-data";

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("websites");

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-extrabold text-foreground">Dashboard</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Deine analysierten Websites, Vergleiche und Aufgaben.
            </p>
          </div>
          <Button asChild size="sm" className="gap-2">
            <Link to="/chat">
              <MessageSquare className="w-4 h-4" />
              Zum Chat
            </Link>
          </Button>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="websites">Websites</TabsTrigger>
            <TabsTrigger value="comparison">Vergleich</TabsTrigger>
            <TabsTrigger value="tasks">Aufgaben</TabsTrigger>
          </TabsList>

          <TabsContent value="websites">
            <WebsiteGrid profiles={mockWebsiteProfiles} />
          </TabsContent>

          <TabsContent value="comparison">
            <ComparisonTable profiles={mockWebsiteProfiles} />
          </TabsContent>

          <TabsContent value="tasks">
            <TaskBoard initialTasks={mockTasks} />
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  );
};

export default Dashboard;
