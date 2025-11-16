import { Helmet } from "react-helmet-async";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AnalysisHistory from "@/components/notion-idea/AnalysisHistory";

const NotionIdea = () => {
  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>AI Analysis History - Your Website Advisor Results | Synoptas</title>
        <meta 
          name="description" 
          content="View and manage your AI website advisor analysis history. Review past recommendations and insights in one organized place." 
        />
        <meta name="keywords" content="AI analysis, website advisor history, business tools, analysis results" />
        <link rel="canonical" href="https://synoptas.com/notion-idea" />
      </Helmet>
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6 md:mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-3">AI Analysis History</h1>
            <p className="text-muted-foreground text-base md:text-lg">
              Review your AI website advisor analysis results
            </p>
          </div>
          
          <AnalysisHistory />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default NotionIdea;
