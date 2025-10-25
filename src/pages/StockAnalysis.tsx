import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Loader2, TrendingUp, Shield, DollarSign, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

interface StockSuggestion {
  name: string;
  ticker: string;
  sector: string;
  assessment: "growth-oriented" | "defensive" | "dividend-strong" | "balanced" | "speculative";
  rationale: string;
}

interface AnalysisResult {
  stocks: StockSuggestion[];
  generalAnalysis: string;
}

interface HistoryItem {
  id: string;
  created_at: string;
  asset_class: string;
  risk_tolerance: string;
  time_horizon: string;
  result: AnalysisResult;
}

const StockAnalysis = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);

  const [riskTolerance, setRiskTolerance] = useState<string>("medium");
  const [timeHorizon, setTimeHorizon] = useState<string>("medium");
  const [age, setAge] = useState<string>("");
  const [assetClass, setAssetClass] = useState<string>("");
  const [marketEvents, setMarketEvents] = useState<string>("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
        loadHistory(session.user.id);
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
        loadHistory(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const loadHistory = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('stock_analysis_history')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      
      const typedHistory: HistoryItem[] = (data || []).map(item => ({
        id: item.id,
        created_at: item.created_at,
        asset_class: item.asset_class,
        risk_tolerance: item.risk_tolerance,
        time_horizon: item.time_horizon,
        result: item.result as unknown as AnalysisResult
      }));
      
      setHistory(typedHistory);
    } catch (error) {
      console.error('Error loading history:', error);
    }
  };

  const handleAnalyze = async () => {
    if (!assetClass) {
      toast.error("Please select an asset class");
      return;
    }

    if (marketEvents.length > 250) {
      toast.error(`Market context too long (${marketEvents.length} characters). Please limit to 250 characters.`);
      return;
    }

    setAnalyzing(true);
    setResult(null);

    try {
      const { data, error } = await supabase.functions.invoke('stock-analysis', {
        body: {
          riskTolerance,
          timeHorizon,
          age: age ? parseInt(age) : undefined,
          assetClass,
          marketEvents
        }
      });

      if (error) throw error;

      setResult(data);

      // Save to history
      if (user) {
        await supabase.from('stock_analysis_history').insert({
          user_id: user.id,
          risk_tolerance: riskTolerance,
          time_horizon: timeHorizon,
          age: age ? parseInt(age) : null,
          asset_class: assetClass,
          market_events: marketEvents,
          result: data
        });
        loadHistory(user.id);
      }

      toast.success("Analysis generated successfully!");
    } catch (error) {
      console.error('Analysis error:', error);
      toast.error("Failed to generate analysis. Please try again.");
    } finally {
      setAnalyzing(false);
    }
  };

  const getAssessmentIcon = (assessment: string) => {
    switch (assessment) {
      case "growth-oriented":
        return <TrendingUp className="h-4 w-4" />;
      case "defensive":
        return <Shield className="h-4 w-4" />;
      case "dividend-strong":
        return <DollarSign className="h-4 w-4" />;
      default:
        return <TrendingUp className="h-4 w-4" />;
    }
  };

  const getAssessmentColor = (assessment: string) => {
    switch (assessment) {
      case "growth-oriented":
        return "bg-green-500/10 text-green-700 dark:text-green-400";
      case "defensive":
        return "bg-blue-500/10 text-blue-700 dark:text-blue-400";
      case "dividend-strong":
        return "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400";
      case "balanced":
        return "bg-purple-500/10 text-purple-700 dark:text-purple-400";
      case "speculative":
        return "bg-red-500/10 text-red-700 dark:text-red-400";
      default:
        return "bg-gray-500/10 text-gray-700 dark:text-gray-400";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {/* History Sidebar */}
          <aside className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Analysis History</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {history.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No history yet</p>
                ) : (
                  history.map((item) => (
                    <div
                      key={item.id}
                      className="p-3 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                      onClick={() => setResult(item.result)}
                    >
                      <div className="font-medium text-sm">{item.asset_class}</div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(item.created_at).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Risk: {item.risk_tolerance} | {item.time_horizon}
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </aside>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">AI Stock Analysis</h1>
          <p className="text-muted-foreground">
            Get personalized stock suggestions based on your investment profile
          </p>
        </div>

        <Card className="mb-6 border-yellow-500/50 bg-yellow-500/5">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-500" />
              <CardTitle className="text-lg">Important Disclaimer</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              These suggestions are purely informational and do NOT constitute financial advice.
              Always conduct your own research and consult with a qualified financial advisor
              before making investment decisions.
            </p>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Investment Profile</CardTitle>
            <CardDescription>Tell us about your investment preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Risk Tolerance</Label>
              <RadioGroup value={riskTolerance} onValueChange={setRiskTolerance}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="low" id="low" />
                  <Label htmlFor="low" className="font-normal cursor-pointer">Low - Prefer stable investments</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="medium" id="medium" />
                  <Label htmlFor="medium" className="font-normal cursor-pointer">Medium - Balanced approach</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="high" id="high" />
                  <Label htmlFor="high" className="font-normal cursor-pointer">High - Willing to take risks</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label>Investment Time Horizon</Label>
              <RadioGroup value={timeHorizon} onValueChange={setTimeHorizon}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="short" id="short" />
                  <Label htmlFor="short" className="font-normal cursor-pointer">Short (1-2 years)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="medium" id="medium-time" />
                  <Label htmlFor="medium-time" className="font-normal cursor-pointer">Medium (3-5 years)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="long" id="long" />
                  <Label htmlFor="long" className="font-normal cursor-pointer">Long (5+ years)</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label htmlFor="age">Age (Optional)</Label>
              <Input
                id="age"
                type="number"
                placeholder="e.g., 35"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                min="18"
                max="100"
                maxLength={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="assetClass">Asset Class</Label>
              <Select value={assetClass} onValueChange={setAssetClass}>
                <SelectTrigger id="assetClass">
                  <SelectValue placeholder="Select asset class" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="stocks">General Stocks</SelectItem>
                  <SelectItem value="etfs">ETFs</SelectItem>
                  <SelectItem value="tech">Technology</SelectItem>
                  <SelectItem value="dividends">Dividend Stocks</SelectItem>
                  <SelectItem value="energy">Energy</SelectItem>
                  <SelectItem value="healthcare">Healthcare</SelectItem>
                  <SelectItem value="finance">Finance</SelectItem>
                  <SelectItem value="consumer">Consumer Goods</SelectItem>
                  <SelectItem value="real-estate">Real Estate</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="marketEvents">
                Market Context (Optional) - Max 250 characters
                {marketEvents && (
                  <span className={`ml-2 text-xs ${marketEvents.length > 250 ? 'text-destructive' : 'text-muted-foreground'}`}>
                    ({marketEvents.length}/250 characters)
                  </span>
                )}
              </Label>
              <Textarea
                id="marketEvents"
                placeholder="e.g., ECB interest rate cut, Strong AI rally in tech sector, Upcoming earnings season"
                value={marketEvents}
                onChange={(e) => setMarketEvents(e.target.value)}
                rows={3}
                maxLength={250}
              />
            </div>

            <Button
              onClick={handleAnalyze}
              disabled={analyzing || !assetClass}
              className="w-full"
              size="lg"
            >
              {analyzing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                "Generate AI Analysis"
              )}
            </Button>
          </CardContent>
        </Card>

        {result && (
          <div className="space-y-6 animate-in fade-in duration-500">
            <div>
              <h2 className="text-2xl font-bold mb-4">AI-Generated Investment Inspiration</h2>
              <Card className="bg-muted/50">
                <CardContent className="pt-6">
                  <p className="text-sm">{result.generalAnalysis}</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-4">
              {result.stocks.map((stock, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-xl mb-1">{stock.name}</CardTitle>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{stock.ticker}</Badge>
                          <span className="text-sm text-muted-foreground">{stock.sector}</span>
                        </div>
                      </div>
                      <Badge className={getAssessmentColor(stock.assessment)}>
                        <span className="flex items-center gap-1">
                          {getAssessmentIcon(stock.assessment)}
                          {stock.assessment}
                        </span>
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{stock.rationale}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card className="border-yellow-500/50 bg-yellow-500/5">
              <CardContent className="pt-6">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-500 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-muted-foreground">
                    <strong>Reminder:</strong> These suggestions are purely informational and do NOT constitute
                    financial advice. Always conduct your own research and consult with a qualified financial
                    advisor before making investment decisions.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default StockAnalysis;
