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
  Gauge,
  Info,
  Save,
  RotateCcw,
  Zap,
  Wand2,
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
  fallbackEnabled: true,
  retryAttempts: 3,
  promptOptimizerEnabled: true,
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

  // Fallback Settings
  const [fallbackEnabled, setFallbackEnabled] = useState(DEFAULTS.fallbackEnabled);
  const [retryAttempts, setRetryAttempts] = useState([DEFAULTS.retryAttempts]);

  // Prompt Optimizer
  const [promptOptimizerEnabled, setPromptOptimizerEnabled] = useState(DEFAULTS.promptOptimizerEnabled);

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
        setFallbackEnabled(data.fallback_enabled ?? DEFAULTS.fallbackEnabled);
        setRetryAttempts([data.retry_attempts ?? DEFAULTS.retryAttempts]);
        setPromptOptimizerEnabled(data.prompt_optimizer_enabled ?? DEFAULTS.promptOptimizerEnabled);
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
        fallback_enabled: fallbackEnabled,
        retry_attempts: retryAttempts[0],
        prompt_optimizer_enabled: promptOptimizerEnabled,
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
        description: "Could not save your optimizer settings. Please try again.",
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
    setFallbackEnabled(DEFAULTS.fallbackEnabled);
    setRetryAttempts([DEFAULTS.retryAttempts]);
    setPromptOptimizerEnabled(DEFAULTS.promptOptimizerEnabled);
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

        {/* Prompt Optimizer (Beta) */}
        <Card className="glass-card border-primary/30">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Wand2 className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <CardTitle>Auto-Prompt Enhancement</CardTitle>
                  </div>
                  <CardDescription>
                    Automatically rewrites user prompts for clarity and precision using Llama-4-Scout (Groq)
                  </CardDescription>
                </div>
              </div>
              <Switch checked={promptOptimizerEnabled} onCheckedChange={setPromptOptimizerEnabled} />
            </div>
          </CardHeader>
          <CardContent className={`space-y-4 ${!promptOptimizerEnabled ? "opacity-50 pointer-events-none" : ""}`}>
            <div className="p-4 rounded-lg bg-muted/30 border border-border/50">
              <div className="flex items-start gap-3">
                <Wand2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-sm font-medium">How it works</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Before each request is sent to your chosen model, the gateway intercepts the user prompt
                    and sends it to <strong>meta-llama/llama-4-scout-17b-16e-instruct</strong> via Groq for
                    instant enhancement. The improved version replaces the original — your users get better
                    results without changing a single line of their code.
                  </p>
                </div>
              </div>
            </div>
            <div className="grid gap-2 text-xs text-muted-foreground sm:grid-cols-3">
              <div className="flex items-center gap-2 p-2 rounded-lg bg-background/50 border border-border/30">
                <span className="text-green-500 font-semibold">~200ms</span>
                <span>avg Groq latency</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-lg bg-background/50 border border-border/30">
                <span className="text-primary font-semibold">Language</span>
                <span>preserved automatically</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-lg bg-background/50 border border-border/30">
                <span className="text-yellow-500 font-semibold">Skipped</span>
                <span>for streaming requests</span>
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
