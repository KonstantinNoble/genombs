import { Helmet } from "react-helmet-async";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import IdeaWorkspace from "@/components/notion-idea/IdeaWorkspace";
import AnalysisHistory from "@/components/notion-idea/AnalysisHistory";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Lightbulb, TrendingUp } from "lucide-react";

const NotionIdea = () => {
  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Notion Idea - Organize Ideas & View AI Analyses | Synoptas</title>
        <meta 
          name="description" 
          content="Organize your business ideas with our Notion-style workspace and view your AI website advisor analysis history in one place." 
        />
        <meta name="keywords" content="idea organization, business planning, notion workspace, idea management, AI analysis, business tools" />
        <link rel="canonical" href="https://synoptas.com/notion-idea" />
      </Helmet>
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-4">Workspace</h1>
            <p className="text-muted-foreground text-lg">
              Organize your business ideas and review your AI analysis history
            </p>
          </div>
          
          <Tabs defaultValue="ideas" className="w-full">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8">
              <TabsTrigger value="ideas" className="flex items-center gap-2">
                <Lightbulb className="w-4 h-4" />
                Idea Workspace
              </TabsTrigger>
              <TabsTrigger value="analyses" className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                AI Analyses
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="ideas" className="space-y-6">
              <IdeaWorkspace />
            </TabsContent>
            
            <TabsContent value="analyses" className="space-y-6">
              <AnalysisHistory />
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default NotionIdea;
