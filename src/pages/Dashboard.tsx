import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ScanCard from "@/components/genome/ScanCard";
import ScanLimitBar from "@/components/genome/ScanLimitBar";
import EmptyState from "@/components/genome/EmptyState";
import StatCard from "@/components/genome/StatCard";
import { SEOHead } from "@/components/seo/SEOHead";
import { useAuth } from "@/contexts/AuthContext";
import { demoScans } from "@/lib/demo-data";

const Dashboard = () => {
  const [url, setUrl] = useState("");
  const [searchFilter, setSearchFilter] = useState("");
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");
  const { user, isPremium } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    navigate("/auth");
    return null;
  }

  const scans = demoScans;

  const filteredScans = scans
    .filter((s) => {
      if (!searchFilter) return true;
      const q = searchFilter.toLowerCase();
      return s.domain.toLowerCase().includes(q) || s.companyName.toLowerCase().includes(q);
    })
    .sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return sortOrder === "newest" ? dateB - dateA : dateA - dateB;
    });

  const completedScans = filteredScans.filter((s) => s.status === "completed");
  const analyzingScans = filteredScans.filter((s) => s.status === "analyzing");
  const failedScans = filteredScans.filter((s) => s.status === "failed");

  const handleScan = () => {
    console.log("Scanning:", url);
  };

  const recentDomains = scans
    .filter((s) => s.status === "completed")
    .slice(0, 3)
    .map((s) => s.domain);

  const renderScanList = (list: typeof filteredScans) => {
    if (list.length === 0) {
      return (
        <div className="text-center py-10 text-sm text-muted-foreground">
          No scans match this filter.
        </div>
      );
    }
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {list.map((scan) => (
          <ScanCard key={scan.id} {...scan} />
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEOHead
        title="Growth Hub – Business Genome"
        description="Scan your website to get a complete growth playbook with ICP, audience channels, and growth strategies."
        canonical="/dashboard"
      />
      <Navbar />

      <main className="flex-1">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 max-w-5xl">
          {/* Welcome + Stats */}
          <div className="mb-8">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground mb-1">
              Growth Hub
            </h1>
            <p className="text-muted-foreground mb-6">
              Scan your website to get growth insights — ICP, audience channels, optimization tips, and strategies.
            </p>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
              <StatCard label="Websites Scanned" value={scans.length} />
              <StatCard label="This Month" value={2} />
              <StatCard label="Scan Credits" value={isPremium ? "∞" : 1}>
                {!isPremium && (
                  <div className="mt-2">
                    <ScanLimitBar used={2} total={3} isPremium={false} />
                  </div>
                )}
              </StatCard>
              <StatCard label="Current Plan" value={isPremium ? "Premium" : "Free"}>
                {!isPremium && (
                  <button
                    onClick={() => navigate("/pricing")}
                    className="mt-2 text-xs text-primary hover:underline"
                  >
                    Upgrade →
                  </button>
                )}
              </StatCard>
            </div>
          </div>

          {/* Competitor Analysis CTA */}
          <Card
            className="border-border bg-card mb-4 cursor-pointer hover:border-primary/30 transition-colors"
            onClick={() => navigate("/competitor-analysis")}
          >
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-sm font-semibold text-foreground">Competitor Analysis</h3>
                  {!isPremium && (
                    <Badge variant="outline" className="text-[10px] bg-primary/15 text-primary border-primary/30">
                      Premium
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Compare your business against up to 3 competitors across 6 growth dimensions.
                </p>
              </div>
              <span className="text-muted-foreground text-sm">→</span>
            </CardContent>
          </Card>

          {/* URL Input */}
          <Card className="border-border bg-card mb-2">
            <CardContent className="p-5 sm:p-6">
              <div className="flex flex-col sm:flex-row gap-3">
                <Input
                  type="url"
                  placeholder="https://example.com"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="h-12 text-base bg-background border-border flex-1"
                />
                <Button
                  size="lg"
                  onClick={handleScan}
                  disabled={!url.trim()}
                  className="h-12 px-8 text-base font-semibold"
                >
                  Scan
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-3">
                Paste your website URL to generate a growth report
              </p>
            </CardContent>
          </Card>

          {/* Recent URLs */}
          {recentDomains.length > 0 && (
            <div className="flex items-center gap-2 mb-8 flex-wrap">
              <span className="text-xs text-muted-foreground">Recent:</span>
              {recentDomains.map((domain) => (
                <button
                  key={domain}
                  onClick={() => setUrl(`https://${domain}`)}
                  className="text-xs px-2.5 py-1 rounded-md bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors font-mono"
                >
                  {domain}
                </button>
              ))}
            </div>
          )}

          {/* Scan History */}
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
              <h2 className="text-xl font-bold text-foreground">Scan History</h2>
              <div className="flex items-center gap-2">
                <Input
                  placeholder="Search domains..."
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  className="h-9 text-sm w-full sm:w-56 bg-background border-border"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSortOrder(sortOrder === "newest" ? "oldest" : "newest")}
                  className="h-9 text-xs shrink-0"
                >
                  {sortOrder === "newest" ? "Newest" : "Oldest"}
                </Button>
              </div>
            </div>

            {scans.length > 0 ? (
              <Tabs defaultValue="all" className="w-full">
                <TabsList className="mb-4 bg-muted">
                  <TabsTrigger value="all">
                    All <Badge variant="secondary" className="ml-1.5 text-[10px] px-1.5">{filteredScans.length}</Badge>
                  </TabsTrigger>
                  <TabsTrigger value="completed">
                    Completed <Badge variant="secondary" className="ml-1.5 text-[10px] px-1.5">{completedScans.length}</Badge>
                  </TabsTrigger>
                  <TabsTrigger value="analyzing">
                    In Progress <Badge variant="secondary" className="ml-1.5 text-[10px] px-1.5">{analyzingScans.length}</Badge>
                  </TabsTrigger>
                  <TabsTrigger value="failed">
                    Failed <Badge variant="secondary" className="ml-1.5 text-[10px] px-1.5">{failedScans.length}</Badge>
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="all">{renderScanList(filteredScans)}</TabsContent>
                <TabsContent value="completed">{renderScanList(completedScans)}</TabsContent>
                <TabsContent value="analyzing">{renderScanList(analyzingScans)}</TabsContent>
                <TabsContent value="failed">{renderScanList(failedScans)}</TabsContent>
              </Tabs>
            ) : (
              <EmptyState
                title="No scans yet"
                description="Paste your website URL above to generate your first growth report."
                showSteps
                onTryExample={() => setUrl("https://stripe.com")}
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
