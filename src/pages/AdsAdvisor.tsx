import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, TrendingUp, Trash2, FileText, Sparkles } from "lucide-react";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ReportPDF } from "@/components/ReportPDF";
import { pdf } from "@react-pdf/renderer";

interface AdRecommendation {
  platform: string;
  adFormat: string;
  targetingStrategy: string;
  adCopyExample: string;
  estimatedCPM: string;
  estimatedCTR: string;
  budgetAllocation: string;
  detailedStrategy?: string[];
  abTestingIdeas?: string[];
  audienceSegments?: string[];
  competitorInsights?: string[];
  kpiMetrics?: string[];
  optimizationTips?: string[];
}

interface AdsAdvisorResult {
  recommendations: AdRecommendation[];
  generalAdvice: string;
}

interface AdsHistoryItem {
  id: string;
  platform: string;
  campaign_type: string;
  budget_range: string;
  product_details: string;
  target_audience?: string;
  product_description?: string;
  result: AdsAdvisorResult;
  created_at: string;
  analysis_mode?: string;
}

const AdsAdvisor = () => {
  const navigate = useNavigate();
  const { user, isPremium, isLoading: authLoading } = useAuth();
  
  const [platform, setPlatform] = useState("");
  const [campaignType, setCampaignType] = useState("");
  const [budgetRange, setBudgetRange] = useState("");
  const [productDetails, setProductDetails] = useState("");
  const [targetAudience, setTargetAudience] = useState("");
  const [productDescription, setProductDescription] = useState("");
  const [analysisMode, setAnalysisMode] = useState<"standard" | "deep">("standard");
  
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AdsAdvisorResult | null>(null);
  const [history, setHistory] = useState<AdsHistoryItem[]>([]);
  const [selectedHistoryId, setSelectedHistoryId] = useState<string | null>(null);
  
  const [deepAnalysisCount, setDeepAnalysisCount] = useState(0);
  const [standardAnalysisCount, setStandardAnalysisCount] = useState(0);
  const [deepWindowStart, setDeepWindowStart] = useState<string | null>(null);
  const [standardWindowStart, setStandardWindowStart] = useState<string | null>(null);

  const deepLimit = isPremium ? 2 : 0;
  const standardLimit = isPremium ? 6 : 2;

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchHistory();
      syncCredits();
    }
  }, [user]);

  const syncCredits = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase.functions.invoke('sync-credits');
      
      if (error) throw error;

      const { data: creditsData, error: creditsError } = await supabase
        .from('user_credits')
        .select('deep_analysis_count, deep_analysis_window_start, standard_analysis_count, standard_analysis_window_start')
        .eq('user_id', user.id)
        .maybeSingle();

      if (creditsError) throw creditsError;

      if (creditsData) {
        setDeepAnalysisCount(creditsData.deep_analysis_count ?? 0);
        setDeepWindowStart(creditsData.deep_analysis_window_start);
        setStandardAnalysisCount(creditsData.standard_analysis_count ?? 0);
        setStandardWindowStart(creditsData.standard_analysis_window_start);
      }
    } catch (error) {
      console.error('Error syncing credits:', error);
    }
  };

  const fetchHistory = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('ads_advisor_history')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setHistory((data || []).map(item => ({
        ...item,
        result: item.result as unknown as AdsAdvisorResult
      })));
    } catch (error) {
      console.error('Error fetching history:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error("Please sign in to use AI Ads Advisor");
      return;
    }

    if (!platform || !campaignType || !budgetRange || !productDetails) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (analysisMode === "deep" && !isPremium) {
      toast.error("Deep Analysis requires a premium subscription");
      return;
    }

    if (analysisMode === "deep" && !targetAudience) {
      toast.error("Please select a target audience for deep analysis");
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) throw new Error("No session");

      const requestBody = {
        platform,
        campaignType,
        budgetRange,
        productDetails,
        analysisMode,
        ...(analysisMode === "deep" && {
          targetAudience,
          productDescription
        })
      };

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ads-advisor`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Analysis failed');
      }

      const data = await response.json();
      setResult(data);
      
      await fetchHistory();
      await syncCredits();
      
      toast.success("Advertising strategy generated successfully!");
    } catch (error: any) {
      console.error('Error:', error);
      toast.error(error.message || "Failed to generate analysis");
    } finally {
      setLoading(false);
    }
  };

  const loadHistoryItem = (item: AdsHistoryItem) => {
    setPlatform(item.platform);
    setCampaignType(item.campaign_type);
    setBudgetRange(item.budget_range);
    setProductDetails(item.product_details);
    setTargetAudience(item.target_audience || "");
    setProductDescription(item.product_description || "");
    setAnalysisMode((item.analysis_mode as "standard" | "deep") || "standard");
    setResult(item.result);
    setSelectedHistoryId(item.id);
  };

  const deleteHistoryItem = async (id: string) => {
    try {
      const { error } = await supabase
        .from('ads_advisor_history')
        .delete()
        .eq('id', id);

      if (error) throw error;

      if (selectedHistoryId === id) {
        setResult(null);
        setSelectedHistoryId(null);
      }

      await fetchHistory();
      toast.success("History item deleted");
    } catch (error) {
      console.error('Error deleting history:', error);
      toast.error("Failed to delete history item");
    }
  };

  const exportToPDF = async () => {
    if (!result) return;

    try {
      const blob = await pdf(
        <ReportPDF
          type="tools"
          result={{
            recommendations: result.recommendations.map(rec => ({
              name: rec.platform,
              category: rec.adFormat,
              implementation: rec.targetingStrategy,
              estimatedCost: rec.estimatedCPM,
              rationale: rec.adCopyExample,
              detailedSteps: rec.detailedStrategy,
              metrics: rec.kpiMetrics,
            })),
            generalAdvice: result.generalAdvice
          }}
          metadata={{
            websiteType: platform,
            websiteStatus: campaignType,
            budgetRange: budgetRange,
            date: new Date().toLocaleDateString(),
            analysisMode: analysisMode
          }}
        />
      ).toBlob();

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `ads-strategy-${platform}-${new Date().toISOString().split('T')[0]}.pdf`;
      link.click();
      URL.revokeObjectURL(url);

      toast.success("PDF exported successfully!");
    } catch (error) {
      console.error('Error exporting PDF:', error);
      toast.error("Failed to export PDF");
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>AI Ads Advisor - Advertising Campaign Recommendations | Synoptas</title>
        <meta 
          name="description" 
          content="Get AI-powered advertising campaign strategies for YouTube, Instagram, Google Ads, Facebook, and more. Optimize your ad spend with data-driven recommendations." 
        />
        <meta 
          name="keywords" 
          content="advertising strategy, paid ads, campaign optimization, digital marketing, Google Ads, Facebook Ads, YouTube advertising" 
        />
      </Helmet>

      <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-background to-primary/5">
        <Navbar />
        
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-4">
                <TrendingUp className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium">AI-Powered Advertising Strategy</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">AI Ads Advisor</h1>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Get expert advertising campaign recommendations powered by AI
              </p>
            </div>

            {isPremium && (
              <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
                <Card className="p-4 border-primary/20">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Deep Analysis</span>
                    <span className="text-sm text-muted-foreground">
                      {deepAnalysisCount}/{deepLimit} used
                    </span>
                  </div>
                </Card>
                <Card className="p-4 border-primary/20">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Standard Analysis</span>
                    <span className="text-sm text-muted-foreground">
                      {standardAnalysisCount}/{standardLimit} used
                    </span>
                  </div>
                </Card>
              </div>
            )}

            {!isPremium && (
              <Card className="p-4 mb-6 border-primary/20 max-w-2xl mx-auto">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Free Analysis</span>
                  <span className="text-sm text-muted-foreground">
                    {standardAnalysisCount}/{standardLimit} used
                  </span>
                </div>
              </Card>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {history.length > 0 && (
                <aside className="lg:col-span-1">
                  <Card className="p-4">
                    <h3 className="font-semibold mb-4">History</h3>
                    <div className="space-y-2">
                      {history.map((item) => (
                        <div
                          key={item.id}
                          className={`p-3 rounded-lg cursor-pointer transition-colors group relative ${
                            selectedHistoryId === item.id
                              ? 'bg-primary/10 border border-primary/20'
                              : 'hover:bg-muted'
                          }`}
                          onClick={() => loadHistoryItem(item)}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{item.platform}</p>
                              <p className="text-xs text-muted-foreground truncate">{item.campaign_type}</p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(item.created_at).toLocaleDateString()}
                              </p>
                              {item.analysis_mode === 'deep' && (
                                <span className="inline-flex items-center gap-1 text-xs text-primary mt-1">
                                  <Sparkles className="h-3 w-3" />
                                  Deep
                                </span>
                              )}
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteHistoryItem(item.id);
                              }}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                </aside>
              )}

              <div className={history.length > 0 ? "lg:col-span-3" : "lg:col-span-4"}>
                <Card className="p-6">
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {isPremium && (
                      <div className="flex gap-2 p-1 bg-muted rounded-lg">
                        <button
                          type="button"
                          onClick={() => setAnalysisMode("standard")}
                          className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                            analysisMode === "standard"
                              ? "bg-background shadow-sm"
                              : "text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          Standard Analysis
                        </button>
                        <button
                          type="button"
                          onClick={() => setAnalysisMode("deep")}
                          className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                            analysisMode === "deep"
                              ? "bg-background shadow-sm"
                              : "text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          <span className="flex items-center justify-center gap-2">
                            <Sparkles className="h-4 w-4" />
                            Deep Analysis
                          </span>
                        </button>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="platform">Platform *</Label>
                        <Select value={platform} onValueChange={setPlatform}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select platform" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="YouTube">YouTube</SelectItem>
                            <SelectItem value="Instagram">Instagram</SelectItem>
                            <SelectItem value="Google Ads">Google Ads</SelectItem>
                            <SelectItem value="Facebook">Facebook</SelectItem>
                            <SelectItem value="TikTok">TikTok</SelectItem>
                            <SelectItem value="LinkedIn">LinkedIn</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="campaignType">Campaign Type *</Label>
                        <Select value={campaignType} onValueChange={setCampaignType}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select campaign type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Brand Awareness">Brand Awareness</SelectItem>
                            <SelectItem value="Lead Generation">Lead Generation</SelectItem>
                            <SelectItem value="Conversions">Conversions</SelectItem>
                            <SelectItem value="Traffic">Traffic</SelectItem>
                            <SelectItem value="App Installs">App Installs</SelectItem>
                            <SelectItem value="Engagement">Engagement</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="budgetRange">Budget Range *</Label>
                        <Select value={budgetRange} onValueChange={setBudgetRange}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select budget range" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="<$500/month">&lt;$500/month</SelectItem>
                            <SelectItem value="$500-$2,000/month">$500-$2,000/month</SelectItem>
                            <SelectItem value="$2,000-$5,000/month">$2,000-$5,000/month</SelectItem>
                            <SelectItem value="$5,000-$10,000/month">$5,000-$10,000/month</SelectItem>
                            <SelectItem value="$10,000+/month">$10,000+/month</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="productDetails">Product Details *</Label>
                      <Textarea
                        id="productDetails"
                        value={productDetails}
                        onChange={(e) => setProductDetails(e.target.value)}
                        placeholder="Brief description of your product or service..."
                        className="min-h-[80px]"
                        maxLength={100}
                      />
                      <p className="text-xs text-muted-foreground">{productDetails.length}/100 characters</p>
                    </div>

                    {analysisMode === 'deep' && (
                      <>
                        <div className="space-y-2">
                          <Label htmlFor="targetAudience">Target Audience *</Label>
                          <Select value={targetAudience} onValueChange={setTargetAudience}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select target audience" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="18-24 young adults">18-24 young adults</SelectItem>
                              <SelectItem value="25-34 professionals">25-34 professionals</SelectItem>
                              <SelectItem value="35-44 established">35-44 established</SelectItem>
                              <SelectItem value="45-54 experienced">45-54 experienced</SelectItem>
                              <SelectItem value="55+ seniors">55+ seniors</SelectItem>
                              <SelectItem value="small business owners">Small business owners</SelectItem>
                              <SelectItem value="enterprise decision makers">Enterprise decision makers</SelectItem>
                              <SelectItem value="students">Students</SelectItem>
                              <SelectItem value="parents">Parents</SelectItem>
                              <SelectItem value="tech enthusiasts">Tech enthusiasts</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="productDescription">Product Description</Label>
                          <Textarea
                            id="productDescription"
                            value={productDescription}
                            onChange={(e) => setProductDescription(e.target.value)}
                            placeholder="Additional product details..."
                            className="min-h-[80px]"
                            maxLength={100}
                          />
                          <p className="text-xs text-muted-foreground">{productDescription.length}/100 characters</p>
                        </div>
                      </>
                    )}

                    <Button type="submit" className="w-full" size="lg" disabled={loading}>
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Generating Strategy...
                        </>
                      ) : (
                        <>
                          <TrendingUp className="mr-2 h-5 w-5" />
                          Generate Advertising Strategy
                        </>
                      )}
                    </Button>
                  </form>

                  {result && (
                    <div className="mt-8 space-y-6">
                      <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-bold">Advertising Recommendations</h2>
                        <Button onClick={exportToPDF} variant="outline">
                          <FileText className="mr-2 h-4 w-4" />
                          Export PDF
                        </Button>
                      </div>

                      <div className="space-y-6">
                        {result.recommendations.map((rec, index) => (
                          <Card key={index} className="p-6">
                            <div className="space-y-4">
                              <div className="flex items-start justify-between">
                                <div>
                                  <h3 className="text-xl font-semibold">{rec.platform}</h3>
                                  <p className="text-sm text-muted-foreground">{rec.adFormat}</p>
                                </div>
                                <div className="text-right">
                                  <p className="text-sm font-medium">Budget: {rec.budgetAllocation}</p>
                                  <p className="text-xs text-muted-foreground">CPM: {rec.estimatedCPM}</p>
                                  <p className="text-xs text-muted-foreground">CTR: {rec.estimatedCTR}</p>
                                </div>
                              </div>

                              <div>
                                <h4 className="font-medium mb-2">Targeting Strategy</h4>
                                <p className="text-sm text-muted-foreground">{rec.targetingStrategy}</p>
                              </div>

                              <div>
                                <h4 className="font-medium mb-2">Ad Copy Example</h4>
                                <p className="text-sm text-muted-foreground italic">{rec.adCopyExample}</p>
                              </div>

                              {rec.detailedStrategy && rec.detailedStrategy.length > 0 && (
                                <div>
                                  <h4 className="font-medium mb-2">Implementation Strategy</h4>
                                  <ul className="space-y-1">
                                    {rec.detailedStrategy.map((item, i) => (
                                      <li key={i} className="text-sm text-muted-foreground flex items-start">
                                        <span className="mr-2">•</span>
                                        <span>{item}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}

                              {rec.abTestingIdeas && rec.abTestingIdeas.length > 0 && (
                                <div>
                                  <h4 className="font-medium mb-2">A/B Testing Ideas</h4>
                                  <ul className="space-y-1">
                                    {rec.abTestingIdeas.map((item, i) => (
                                      <li key={i} className="text-sm text-muted-foreground flex items-start">
                                        <span className="mr-2">•</span>
                                        <span>{item}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}

                              {rec.audienceSegments && rec.audienceSegments.length > 0 && (
                                <div>
                                  <h4 className="font-medium mb-2">Audience Segments</h4>
                                  <ul className="space-y-1">
                                    {rec.audienceSegments.map((item, i) => (
                                      <li key={i} className="text-sm text-muted-foreground flex items-start">
                                        <span className="mr-2">•</span>
                                        <span>{item}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}

                              {rec.kpiMetrics && rec.kpiMetrics.length > 0 && (
                                <div>
                                  <h4 className="font-medium mb-2">KPI Metrics</h4>
                                  <ul className="space-y-1">
                                    {rec.kpiMetrics.map((item, i) => (
                                      <li key={i} className="text-sm text-muted-foreground flex items-start">
                                        <span className="mr-2">•</span>
                                        <span>{item}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          </Card>
                        ))}
                      </div>

                      {result.generalAdvice && (
                        <Card className="p-6 bg-primary/5">
                          <h3 className="font-semibold mb-3">Strategic Overview</h3>
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            {result.generalAdvice}
                          </p>
                        </Card>
                      )}
                    </div>
                  )}
                </Card>
              </div>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default AdsAdvisor;
