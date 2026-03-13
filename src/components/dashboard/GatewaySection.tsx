import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Key,
  Copy,
  Check,
  Eye,
  EyeOff,
  Shield,
  Link,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Trash2,
  Lock,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase/external-client";
import { useAuth } from "@/contexts/AuthContext";

type Provider = "openai" | "anthropic" | "google";

interface ProviderKeyMeta {
  id: string;
  provider: Provider;
  key_prefix: string | null;   // e.g. "...abcd"
  is_active: boolean;
  last_used_at: string | null;
  updated_at: string;
}

const PROVIDERS: { id: Provider; label: string; models: string; placeholder: string }[] = [
  { id: "openai", label: "OpenAI", models: "GPT-5.4 Thinking, GPT-5.3 Instant", placeholder: "sk-..." },
  { id: "anthropic", label: "Anthropic", models: "Claude Opus 4.6, Claude 3.5 Haiku", placeholder: "sk-ant-..." },
  { id: "google", label: "Google AI", models: "Gemini 3.1 Pro, Gemini 3.1 Flash", placeholder: "AIza..." },
];

const GatewaySection = () => {
  const { toast } = useToast();
  const { user } = useAuth();

  // Saved key metadata from server (NO plaintext)
  const [savedKeys, setSavedKeys] = useState<Record<Provider, ProviderKeyMeta | null>>({
    openai: null, anthropic: null, google: null,
  });

  // Input values — local only, cleared after save, never sent back from server
  const [inputs, setInputs] = useState<Record<Provider, string>>({
    openai: "", anthropic: "", google: "",
  });

  const [showKey, setShowKey] = useState<Record<Provider, boolean>>({ openai: false, anthropic: false, google: false });
  const [saving, setSaving] = useState<Record<Provider, boolean>>({ openai: false, anthropic: false, google: false });
  const [deleting, setDeleting] = useState<Record<Provider, boolean>>({ openai: false, anthropic: false, google: false });
  const [loadingKeys, setLoadingKeys] = useState(true);
  const [copiedProxy, setCopiedProxy] = useState(false);

  const [saasKey, setSaasKey] = useState<string | null>(null);
  const [copiedSaas, setCopiedSaas] = useState(false);
  const [loadingSaas, setLoadingSaas] = useState(true);

  const proxyEndpoint = "https://gateway.synvertas.com/v1";

  // ─── Load key metadata from server ─────────────────────────────────────────
  const loadKeys = useCallback(async () => {
    if (!user) return;
    setLoadingKeys(true);
    try {
      const { data, error } = await supabase.functions.invoke("manage-provider-keys", {
        method: "GET",
      });
      if (error) throw error;

      const map: Record<Provider, ProviderKeyMeta | null> = {
        openai: null, anthropic: null, google: null,
      };
      (data.keys as ProviderKeyMeta[]).forEach((k) => {
        map[k.provider] = k;
      });
      setSavedKeys(map);
    } catch (err: any) {
      console.error("[GatewaySection] loadKeys:", err.message);
    } finally {
      setLoadingKeys(false);
    }
  }, [user]);

  // ─── Load the SaaS key (sgw_...) ───────────────────────────────────────────
  const loadSaasKey = useCallback(async () => {
    if (!user) return;
    setLoadingSaas(true);
    try {
      const { data, error } = await supabase
        .from("gateway_saas_keys")
        .select("api_key")
        .eq("user_id", user.id)
        .maybeSingle();
      if (!error && data?.api_key) {
        setSaasKey(data.api_key);
      }
    } catch (err: any) {
      console.error("[GatewaySection] loadSaasKey:", err.message);
    } finally {
      setLoadingSaas(false);
    }
  }, [user]);

  useEffect(() => {
    loadKeys();
    loadSaasKey();
  }, [loadKeys, loadSaasKey]);

  // ─── Save a provider key ────────────────────────────────────────────────────
  const handleSaveKey = async (provider: Provider) => {
    const plainKey = inputs[provider].trim();
    if (!plainKey) {
      toast({ title: "Empty key", description: "Please enter an API key.", variant: "destructive" });
      return;
    }

    setSaving((s) => ({ ...s, [provider]: true }));
    try {
      const { data, error } = await supabase.functions.invoke("manage-provider-keys", {
        method: "POST",
        body: { provider, api_key: plainKey },
      });
      if (error) throw error;

      toast({
        title: "Key saved",
        description: `${PROVIDERS.find((p) => p.id === provider)?.label} key encrypted and stored.`,
      });

      // Clear input — plaintext is gone from frontend
      setInputs((i) => ({ ...i, [provider]: "" }));
      setShowKey((s) => ({ ...s, [provider]: false }));
      await loadKeys(); // Refresh metadata
    } catch (err: any) {
      toast({ title: "Error saving key", description: err.message, variant: "destructive" });
    } finally {
      setSaving((s) => ({ ...s, [provider]: false }));
    }
  };

  // ─── Delete a provider key ──────────────────────────────────────────────────
  const handleDeleteKey = async (provider: Provider) => {
    setDeleting((d) => ({ ...d, [provider]: true }));
    try {
      const { error } = await supabase.functions.invoke(
        `manage-provider-keys?provider=${provider}`,
        { method: "DELETE" },
      );
      if (error) throw error;

      toast({ title: "Key removed", description: `${provider} API key deleted.` });
      setSavedKeys((k) => ({ ...k, [provider]: null }));
      setInputs((i) => ({ ...i, [provider]: "" }));
    } catch (err: any) {
      toast({ title: "Error deleting key", description: err.message, variant: "destructive" });
    } finally {
      setDeleting((d) => ({ ...d, [provider]: false }));
    }
  };

  // ─── Copy helpers ───────────────────────────────────────────────────────────
  const copyToClipboard = async (text: string, which: "proxy" | "saas") => {
    await navigator.clipboard.writeText(text);
    if (which === "proxy") {
      setCopiedProxy(true);
      setTimeout(() => setCopiedProxy(false), 2000);
    } else {
      setCopiedSaas(true);
      setTimeout(() => setCopiedSaas(false), 2000);
    }
    toast({ title: "Copied!", description: "Copied to clipboard." });
  };

  // ─── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">

      {/* ── Proxy Endpoint ── */}
      <Card className="glass-card border-primary/20">
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Link className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle>Your Gateway Endpoint</CardTitle>
              <CardDescription>Replace your provider URLs with this single endpoint</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Input value={proxyEndpoint} readOnly className="font-mono text-sm pr-16 bg-background/50" />
              <Badge variant="secondary" className="absolute right-2 top-1/2 -translate-y-1/2 text-xs">
                HTTPS
              </Badge>
            </div>
            <Button variant="outline" size="icon" onClick={() => copyToClipboard(proxyEndpoint, "proxy")} className="shrink-0">
              {copiedProxy ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>

          {/* Quick-start example */}
          <div className="rounded-lg bg-muted/50 p-4 border border-border/50 space-y-2">
            <p className="text-xs text-muted-foreground">Quick Start (OpenAI SDK)</p>
            <pre className="text-xs font-mono text-foreground/80 overflow-x-auto whitespace-pre-wrap">
              {`import OpenAI from 'openai';

const client = new OpenAI({
  baseURL: '${proxyEndpoint}',
  apiKey: '${saasKey ?? "YOUR_SYNVERTAS_KEY"}',
});`}
            </pre>
          </div>

          {/* SaaS API Key */}
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Your Synvertas Gateway Key</Label>
            <div className="flex gap-2">
              <div className="flex-1 relative">
                {loadingSaas ? (
                  <div className="flex items-center gap-2 h-10 px-3 text-xs text-muted-foreground">
                    <Loader2 className="h-3 w-3 animate-spin" /> Loading…
                  </div>
                ) : (
                  <Input
                    value={saasKey ?? "—"}
                    readOnly
                    className="font-mono text-xs bg-background/50"
                  />
                )}
              </div>
              {saasKey && (
                <Button variant="outline" size="icon" onClick={() => copyToClipboard(saasKey, "saas")} className="shrink-0">
                  {copiedSaas ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── API Key Vault ── */}
      <Card className="glass-card">
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Shield className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle>API Key Vault</CardTitle>
              <CardDescription>
                Securely store your LLM provider keys. Encrypted with AES-256-GCM — plaintext never
                leaves the server.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loadingKeys ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground py-4">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading saved keys…
            </div>
          ) : (
            <div className="space-y-4">
              {PROVIDERS.map((p) => {
                const saved = savedKeys[p.id];
                return (
                  <div
                    key={p.id}
                    className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-lg border border-border/50 bg-background/30 hover:border-border transition-colors"
                  >
                    {/* Provider icon */}
                    <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                      <span className="text-sm font-bold text-foreground">
                        {p.label[0]}
                      </span>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-sm">{p.label}</span>
                        {saved ? (
                          <Badge variant="secondary" className="text-xs bg-green-500/10 text-green-500 border-green-500/20">
                            <CheckCircle2 className="h-3 w-3 mr-1" /> Connected
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="text-xs bg-yellow-500/10 text-yellow-500 border-yellow-500/20">
                            <AlertCircle className="h-3 w-3 mr-1" /> Not configured
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {p.models}
                        {saved?.key_prefix && (
                          <span className="ml-2 font-mono text-muted-foreground/60">
                            {saved.key_prefix}
                          </span>
                        )}
                      </p>
                    </div>

                    {/* Input + actions */}
                    <div className="flex items-center gap-2 w-full sm:w-80">
                      <div className="relative flex-1">
                        <Key className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          type={showKey[p.id] ? "text" : "password"}
                          value={inputs[p.id]}
                          onChange={(e) => setInputs((i) => ({ ...i, [p.id]: e.target.value }))}
                          placeholder={saved ? `••••••••${saved.key_prefix ?? "****"} (Saved)` : p.placeholder}
                          className="pl-9 pr-9 font-mono text-xs"
                          onKeyDown={(e) => { if (e.key === "Enter") handleSaveKey(p.id); }}
                        />
                        {saved && !inputs[p.id] ? (
                          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" title="Key is encrypted and cannot be revealed">
                            <Lock className="h-4 w-4" />
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setShowKey((s) => ({ ...s, [p.id]: !s[p.id] }))}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                          >
                            {showKey[p.id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        )}
                      </div>

                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleSaveKey(p.id)}
                        disabled={saving[p.id] || !inputs[p.id]}
                      >
                        {saving[p.id] ? <Loader2 className="h-3 w-3 animate-spin" /> : "Save"}
                      </Button>

                      {saved && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteKey(p.id)}
                          disabled={deleting[p.id]}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10 px-2"
                        >
                          {deleting[p.id]
                            ? <Loader2 className="h-3 w-3 animate-spin" />
                            : <Trash2 className="h-4 w-4" />}
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Security note */}
          <div className="mt-6 p-4 rounded-lg bg-muted/30 border border-border/50">
            <div className="flex items-start gap-3">
              <Shield className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium">Security Architecture</p>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  Keys are encrypted with <strong>AES-256-GCM</strong> on the server before storage.
                  The plaintext key never leaves the Edge Function and is never returned to the browser.
                  Decryption happens exclusively inside the proxy at request time.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Status ── */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="glass-card">
          <CardContent className="pt-6">
            <Label className="text-sm text-muted-foreground">Gateway Status</Label>
            <div className="flex items-center gap-2 mt-2">
              <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-lg font-semibold">Operational</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">All systems running normally</p>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="pt-6">
            <Label className="text-sm text-muted-foreground">Connected Providers</Label>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-lg font-semibold">
                {Object.values(savedKeys).filter(Boolean).length} of {PROVIDERS.length}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">providers configured</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default GatewaySection;
