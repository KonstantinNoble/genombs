import { Helmet } from "react-helmet-async";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import IdeaWorkspace from "@/components/notion-idea/IdeaWorkspace";

const NotionIdea = () => {
  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Notion Idea - Organize Your Business Ideas | Synoptas</title>
        <meta 
          name="description" 
          content="Organize and manage your business ideas with our Notion-style workspace. Drag, drop, and categorize your ideas for better planning and execution." 
        />
        <meta name="keywords" content="idea organization, business planning, notion workspace, idea management, business brainstorming" />
        <link rel="canonical" href="https://synoptas.com/notion-idea" />
      </Helmet>
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-4">Notion Idea Workspace</h1>
            <p className="text-muted-foreground text-lg">
              Organize your business ideas in a flexible workspace. Create, categorize, and manage your ideas to turn concepts into action.
            </p>
          </div>
          <IdeaWorkspace />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default NotionIdea;
