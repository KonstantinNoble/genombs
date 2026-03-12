import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Database,
  Route,
  Gauge,
  Sparkles,
  Info,
  Save,
  RotateCcw,
  Zap,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";

const OptimizerSection = () => {
  const { toast } = useToast();
  
  // Cache Settings
  const [cacheSimilarity, setCacheSimilarity] = useState([95]);
  const [cacheEnabled, setCacheEnabled] = useState(true);
  const [cacheTTL, setCacheTTL] = useState("24h");

  // Smart Routing Settings
  const [smartRoutingEnabled, setSmartRoutingEnabled] = useState(true);
  const [shortQueryModel, setShortQueryModel] = useState("gpt-3.5-turbo");
  const [longQueryModel, setLongQueryModel] = useState("gpt-4");
  const [shortQueryThreshold, setShortQueryThreshold] = useState([100]);

  // Fallback Settings
  const [fallbackEnabled, setFallbackEnabled] = useState(true);
  const [retryAttempts, setRetryAttempts] = useState([3]);

  const handleSaveSettings = () => {
    toast({
      title: "Settings Saved",
      description: "Your optimizer configuration has been updated.",
    });
  };

  const handleResetDefaults = () => {
    setCacheSimilarity([95]);
    setCacheEnabled(true);
    setCacheTTL("24h");
    setSmartRoutingEnabled(true);
    setShortQueryModel("gpt-3.5-turbo");
    setLongQueryModel("gpt-4");
    setShortQueryThreshold([100]);
    setFallbackEnabled(true);
    setRetryAttempts([3]);
    toast({
      title: "Settings Reset",
      description: "All settings have been restored to defaults.",
    });
  };

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Cache Configuration */}
        <Card className="glass-card">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Database className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle>Semantic Cache</CardTitle>
                  <CardDescription>
                    Cache similar requests to reduce API calls and latency
                  </CardDescription>
                </div>
              </div>
              <Switch
                checked={cacheEnabled}
                onCheckedChange={setCacheEnabled}
              />
            </div>
          </CardHeader>
          <CardContent className={`space-y-6 ${!cacheEnabled ? "opacity-50 pointer-events-none" : ""}`}>
            {/* Similarity Threshold */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Label className="text-sm font-medium">Cache Similarity Threshold</Label>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="h-4 w-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p>
                        How similar a new query must be to a cached query to return the cached response.
                        Higher values = more accurate but fewer cache hits.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <Badge variant="secondary" className="font-mono">
                  {cacheSimilarity[0]}%
                </Badge>
              </div>
              <Slider
                value={cacheSimilarity}
                onValueChange={setCacheSimilarity}
                min={70}
                max={100}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>More cache hits</span>
                <span>More accurate</span>
              </div>
            </div>

            {/* Cache TTL */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label className="text-sm font-medium">Cache Duration (TTL)</Label>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-4 w-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>How long cached responses remain valid</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <Select value={cacheTTL} onValueChange={setCacheTTL}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1h">1 Hour</SelectItem>
                  <SelectItem value="6h">6 Hours</SelectItem>
                  <SelectItem value="24h">24 Hours</SelectItem>
                  <SelectItem value="7d">7 Days</SelectItem>
                  <SelectItem value="30d">30 Days</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Cache Stats Preview */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border/50">
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">87%</p>
                <p className="text-xs text-muted-foreground">Hit Rate</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">12.4K</p>
                <p className="text-xs text-muted-foreground">Cached Entries</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-500">$847</p>
                <p className="text-xs text-muted-foreground">Saved This Month</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Smart Routing */}
        <Card className="glass-card">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Route className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle>Smart Routing</CardTitle>
                  <CardDescription>
                    Automatically route queries to the most cost-effective model
                  </CardDescription>
                </div>
              </div>
              <Switch
                checked={smartRoutingEnabled}
                onCheckedChange={setSmartRoutingEnabled}
              />
            </div>
          </CardHeader>
          <CardContent className={`space-y-6 ${!smartRoutingEnabled ? "opacity-50 pointer-events-none" : ""}`}>
            {/* Query Length Threshold */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Label className="text-sm font-medium">Short Query Threshold</Label>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="h-4 w-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p>
                        Queries shorter than this token count will be routed to the cheaper model.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <Badge variant="secondary" className="font-mono">
                  {shortQueryThreshold[0]} tokens
                </Badge>
              </div>
              <Slider
                value={shortQueryThreshold}
                onValueChange={setShortQueryThreshold}
                min={50}
                max={500}
                step={10}
                className="w-full"
              />
            </div>

            {/* Model Selection */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Short Queries</Label>
                <Select value={shortQueryModel} onValueChange={setShortQueryModel}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo ($0.002/1K)</SelectItem>
                    <SelectItem value="claude-instant">Claude Instant ($0.0008/1K)</SelectItem>
                    <SelectItem value="mistral-small">Mistral Small ($0.001/1K)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">Cheaper, faster model</p>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Long/Complex Queries</Label>
                <Select value={longQueryModel} onValueChange={setLongQueryModel}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gpt-4">GPT-4 ($0.03/1K)</SelectItem>
                    <SelectItem value="claude-3-opus">Claude 3 Opus ($0.015/1K)</SelectItem>
                    <SelectItem value="mistral-large">Mistral Large ($0.008/1K)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">More capable model</p>
              </div>
            </div>

            {/* Routing Preview */}
            <div className="p-4 rounded-lg bg-muted/30 border border-border/50">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">Routing Preview</span>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between p-2 rounded bg-background/50">
                  <span className="text-muted-foreground">"What's the weather?"</span>
                  <Badge variant="outline" className="text-xs">GPT-3.5</Badge>
                </div>
                <div className="flex items-center justify-between p-2 rounded bg-background/50">
                  <span className="text-muted-foreground">"Analyze this 2000-word document..."</span>
                  <Badge variant="outline" className="text-xs">GPT-4</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Fallback & Retry */}
        <Card className="glass-card">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Gauge className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle>Reliability Settings</CardTitle>
                  <CardDescription>
                    Configure fallback behavior and retry logic
                  </CardDescription>
                </div>
              </div>
              <Switch
                checked={fallbackEnabled}
                onCheckedChange={setFallbackEnabled}
              />
            </div>
          </CardHeader>
          <CardContent className={`space-y-6 ${!fallbackEnabled ? "opacity-50 pointer-events-none" : ""}`}>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Label className="text-sm font-medium">Retry Attempts</Label>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="h-4 w-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Number of retries before failing or falling back</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <Badge variant="secondary" className="font-mono">
                  {retryAttempts[0]}x
                </Badge>
              </div>
              <Slider
                value={retryAttempts}
                onValueChange={setRetryAttempts}
                min={1}
                max={5}
                step={1}
                className="w-full"
              />
            </div>

            <div className="p-4 rounded-lg bg-muted/30 border border-border/50">
              <div className="flex items-start gap-3">
                <Zap className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Automatic Fallback</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    If primary provider fails, requests automatically route to backup providers
                    (OpenAI → Anthropic → Mistral)
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3">
          <Button variant="outline" onClick={handleResetDefaults}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset to Defaults
          </Button>
          <Button onClick={handleSaveSettings}>
            <Save className="h-4 w-4 mr-2" />
            Save Settings
          </Button>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default OptimizerSection;
