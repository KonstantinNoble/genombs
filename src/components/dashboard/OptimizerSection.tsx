import { useState, useEffect } from "react";
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
  Loader2,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase/external-client";
import { useAuth } from "@/contexts/AuthContext";

// ── Defaults ──────────────────────────────────────────────────────────────────

const DEFAULTS = {
  cacheSimilarity: 95,
  cacheEnabled: true,
  cacheTTLHours: 24,
  smartRoutingEnabled: true,
  shortQueryModel: "gpt-5.3-instant",
  longQueryModel: "gpt-5.4-thinking",
  shortQueryThreshold: 100,
  fallbackEnabled: true,
  retryAttempts: 3,
};

const TTL_OPTIONS = [
  { label: "1 Hour", value: 1 },
  { label: "6 Hours", value: 6 },
  { label: "24 Hours", value: 24 },
  { label: "7 Days", value: 168 },
  { label: "30 Days", value: 720 },
];

// ── Component ─────────────────────────────────────────────────────────────────

const OptimizerSection = () => {
  const { toast } = useToast();
  const { user } = useAuth();

  // Loading states
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Cache Settings
  const [cacheEnabled, setCacheEnabled] = useState(DEFAULTS.cacheEnabled);
  const [cacheSimilarity, setCacheSimilarity] = useState([DEFAULTS.cacheSimilarity]);
  const [cacheTTLHours, setCacheTTLHours] = useState(DEFAULTS.cacheTTLHours);

  // Smart Routing Settings
  const [smartRoutingEnabled, setSmartRoutingEnabled] = useState(DEFAULTS.smartRoutingEnabled);
  const [shortQueryModel, setShortQueryModel] = useState(DEFAULTS.shortQueryModel);
  const [longQueryModel, setLongQueryModel] = useState(DEFAULTS.longQueryModel);
  const [shortQueryThreshold, setShortQueryThreshold] = useState([DEFAULTS.shortQueryThreshold]);

  // Fallback Settings
  const [fallbackEnabled, setFallbackEnabled] = useState(DEFAULTS.fallbackEnabled);
  const [retryAttempts, setRetryAttempts] = useState([DEFAULTS.retryAttempts]);

  // ── Load settings from DB on mount ─────────────────────────────────────────
  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const load = async () => {
      setLoading(true);
      const { data, error } = await (supabase as any)
        .from("gateway_settings")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!error && data) {
        setCacheEnabled(data.cache_enabled ?? DEFAULTS.cacheEnabled);
        setCacheSimilarity([Math.round((data.cache_similarity ?? DEFAULTS.cacheSimilarity / 100) * 100)]);
        setCacheTTLHours(data.cache_ttl_hours ?? DEFAULTS.cacheTTLHours);
        setSmartRoutingEnabled(data.smart_routing_enabled ?? DEFAULTS.smartRoutingEnabled);
        setShortQueryModel(data.short_query_model ?? DEFAULTS.shortQueryModel);
        setLongQueryModel(data.long_query_model ?? DEFAULTS.longQueryModel);
        setShortQueryThreshold([data.short_query_threshold ?? DEFAULTS.shortQueryThreshold]);
        setFallbackEnabled(data.fallback_enabled ?? DEFAULTS.fallbackEnabled);
        setRetryAttempts([data.retry_attempts ?? DEFAULTS.retryAttempts]);
      }
      setLoading(false);
    };
    load();
  }, [user]);

  // ── Save settings to DB ─────────────────────────────────────────────────────
  const handleSaveSettings = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const payload = {
        user_id: user.id,
        cache_enabled: cacheEnabled,
        cache_similarity: cacheSimilarity[0] / 100, // store as 0–1
        cache_ttl_hours: cacheTTLHours,
        smart_routing_enabled: smartRoutingEnabled,
        short_query_model: shortQueryModel,
        long_query_model: longQueryModel,
        short_query_threshold: shortQueryThreshold[0],
        fallback_enabled: fallbackEnabled,
        retry_attempts: retryAttempts[0],
        updated_at: new Date().toISOString(),
      };

      const { error } = await (supabase as any)
        .from("gateway_settings")
        .upsert(payload, { onConflict: "user_id" });

      if (error) throw error;

      toast({
        title: "Settings Saved ✓",
        description: "Your gateway configuration has been updated.",
      });
    } catch (err: unknown) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Could not save settings.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  // ── Reset to defaults ───────────────────────────────────────────────────────
  const handleResetDefaults = () => {
    setCacheEnabled(DEFAULTS.cacheEnabled);
    setCacheSimilarity([DEFAULTS.cacheSimilarity]);
    setCacheTTLHours(DEFAULTS.cacheTTLHours);
    setSmartRoutingEnabled(DEFAULTS.smartRoutingEnabled);
    setShortQueryModel(DEFAULTS.shortQueryModel);
    setLongQueryModel(DEFAULTS.longQueryModel);
    setShortQueryThreshold([DEFAULTS.shortQueryThreshold]);
    setFallbackEnabled(DEFAULTS.fallbackEnabled);
    setRetryAttempts([DEFAULTS.retryAttempts]);
    toast({ title: "Settings Reset", description: "Restored to default values." });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

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
                  <CardDescription>Cache similar requests to reduce API calls and latency</CardDescription>
                </div>
              </div>
              <Switch checked={cacheEnabled} onCheckedChange={setCacheEnabled} />
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
                <Badge variant="secondary" className="font-mono">{cacheSimilarity[0]}%</Badge>
              </div>
              <Slider
                value={cacheSimilarity}
                onValueChange={setCacheSimilarity}
                min={70} max={100} step={1} className="w-full"
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
              <Select
                value={String(cacheTTLHours)}
                onValueChange={(v) => setCacheTTLHours(Number(v))}
              >
                <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {TTL_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={String(o.value)}>{o.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
                  <CardDescription>Automatically route queries to the most cost-effective model</CardDescription>
                </div>
              </div>
              <Switch checked={smartRoutingEnabled} onCheckedChange={setSmartRoutingEnabled} />
            </div>
          </CardHeader>
          <CardContent className={`space-y-6 ${!smartRoutingEnabled ? "opacity-50 pointer-events-none" : ""}`}>
            {/* Threshold */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Label className="text-sm font-medium">Short Query Threshold</Label>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="h-4 w-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p>Queries shorter than this token count will be routed to the cheaper model.</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <Badge variant="secondary" className="font-mono">{shortQueryThreshold[0]} tokens</Badge>
              </div>
              <Slider
                value={shortQueryThreshold}
                onValueChange={setShortQueryThreshold}
                min={50} max={500} step={10} className="w-full"
              />
            </div>

            {/* Model Selection */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Short Queries</Label>
                <Select value={shortQueryModel} onValueChange={setShortQueryModel}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gpt-5.3-instant">GPT-5.3 Instant</SelectItem>
                    <SelectItem value="gemini-3.1-flash">Gemini 3.1 Flash</SelectItem>
                    <SelectItem value="claude-3-5-haiku">Claude 3.5 Haiku</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">Cheaper, faster model</p>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Long/Complex Queries</Label>
                <Select value={longQueryModel} onValueChange={setLongQueryModel}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gpt-5.4-thinking">GPT-5.4 Thinking</SelectItem>
                    <SelectItem value="gemini-3.1-pro">Gemini 3.1 Pro</SelectItem>
                    <SelectItem value="claude-4-6-opus">Claude Opus 4.6</SelectItem>
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
                  <Badge variant="outline" className="text-xs">{shortQueryModel}</Badge>
                </div>
                <div className="flex items-center justify-between p-2 rounded bg-background/50">
                  <span className="text-muted-foreground">"Analyze this 2000-word document..."</span>
                  <Badge variant="outline" className="text-xs">{longQueryModel}</Badge>
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
                  <CardDescription>Configure fallback behavior and retry logic</CardDescription>
                </div>
              </div>
              <Switch checked={fallbackEnabled} onCheckedChange={setFallbackEnabled} />
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
                <Badge variant="secondary" className="font-mono">{retryAttempts[0]}x</Badge>
              </div>
              <Slider
                value={retryAttempts}
                onValueChange={setRetryAttempts}
                min={1} max={5} step={1} className="w-full"
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
          <Button variant="outline" onClick={handleResetDefaults} disabled={saving}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset to Defaults
          </Button>
          <Button onClick={handleSaveSettings} disabled={saving}>
            {saving ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            {saving ? "Saving..." : "Save Settings"}
          </Button>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default OptimizerSection;
