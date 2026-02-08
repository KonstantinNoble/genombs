import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Globe, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ScanCard from "@/components/genome/ScanCard";
import ScanLimitBar from "@/components/genome/ScanLimitBar";
import EmptyState from "@/components/genome/EmptyState";
import { SEOHead } from "@/components/seo/SEOHead";
import { useAuth } from "@/contexts/AuthContext";
import { demoScans } from "@/lib/demo-data";

const Dashboard = () => {
  const [url, setUrl] = useState("");
  const { user, isPremium } = useAuth();
  const navigate = useNavigate();

  // Redirect to auth if not logged in
  if (!user) {
    navigate("/auth");
    return null;
  }

  // Demo: show all scans
  const scans = demoScans;
  const hasScans = scans.length > 0;

  const handleAnalyze = () => {
    // Will be connected to backend later
    console.log("Analyzing:", url);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEOHead
        title="Dashboard – Business Genome"
        description="Analyze any business from a single URL. Get structured market intelligence reports."
        canonical="/dashboard"
      />
      <Navbar />

      <main className="flex-1">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 max-w-5xl">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground mb-2">
              Dashboard
            </h1>
            <p className="text-muted-foreground">
              Enter a URL to generate a Business Genome – a structured intelligence report.
            </p>
          </div>

          {/* URL Input Section */}
          <Card className="border-border bg-card mb-6">
            <CardContent className="p-5 sm:p-6">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="url"
                    placeholder="https://example.com"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="pl-10 h-12 text-base bg-background border-border"
                  />
                </div>
                <Button
                  size="lg"
                  onClick={handleAnalyze}
                  disabled={!url.trim()}
                  className="h-12 px-8 text-base font-semibold"
                >
                  <Search className="w-4 h-4 mr-2" />
                  Analyze
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Scan Limit */}
          <div className="mb-8">
            <ScanLimitBar used={2} total={3} isPremium={isPremium} />
            {!isPremium && (
              <button
                onClick={() => navigate("/pricing")}
                className="mt-2 text-xs text-primary hover:underline flex items-center gap-1"
              >
                Upgrade to Premium for unlimited analyses
                <ArrowRight className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Scan History */}
          <div>
            <h2 className="text-xl font-bold text-foreground mb-4">Recent Analyses</h2>
            {hasScans ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {scans.map((scan) => (
                  <ScanCard key={scan.id} {...scan} />
                ))}
              </div>
            ) : (
              <EmptyState
                icon={Search}
                title="No analyses yet"
                description="Enter a URL above to generate your first Business Genome report."
              />
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Dashboard;
