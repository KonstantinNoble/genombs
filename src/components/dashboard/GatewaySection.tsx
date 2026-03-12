import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

interface APIKeyConfig {
  id: string;
  provider: string;
  name: string;
  keyPrefix: string;
  isConfigured: boolean;
}

const apiProviders: APIKeyConfig[] = [
  {
    id: "openai",
    provider: "OpenAI",
    name: "GPT-4, GPT-3.5",
    keyPrefix: "sk-",
    isConfigured: true,
  },
  {
    id: "anthropic",
    provider: "Anthropic",
    name: "Claude 3, Claude 2",
    keyPrefix: "sk-ant-",
    isConfigured: true,
  },
  {
    id: "google",
    provider: "Google AI",
    name: "Gemini Pro, PaLM",
    keyPrefix: "AI",
    isConfigured: false,
  },
  {
    id: "mistral",
    provider: "Mistral AI",
    name: "Mistral Large, Medium",
    keyPrefix: "mk-",
    isConfigured: false,
  },
];

const GatewaySection = () => {
  const { toast } = useToast();
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const [keys, setKeys] = useState<Record<string, string>>({
    openai: "sk-****************************abcd",
    anthropic: "sk-ant-***********************efgh",
    google: "",
    mistral: "",
  });
  const [copiedProxy, setCopiedProxy] = useState(false);

  const proxyEndpoint = "https://gateway.synvertas.com/v1";

  const toggleKeyVisibility = (id: string) => {
    setShowKeys((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const copyProxyLink = async () => {
    await navigator.clipboard.writeText(proxyEndpoint);
    setCopiedProxy(true);
    toast({
      title: "Copied",
      description: "Proxy endpoint copied to clipboard",
    });
    setTimeout(() => setCopiedProxy(false), 2000);
  };

  const handleKeyChange = (id: string, value: string) => {
    setKeys((prev) => ({ ...prev, [id]: value }));
  };

  const handleSaveKey = (id: string) => {
    toast({
      title: "API Key Saved",
      description: `Your ${apiProviders.find((p) => p.id === id)?.provider} key has been securely stored.`,
    });
  };

  return (
    <div className="space-y-8">
      {/* Section Header */}
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Gateway</h2>
        <p className="text-muted-foreground mt-1">Configure your connection and API keys</p>
      </div>

      {/* Proxy Endpoint Section */}
      <Card className="bg-card/50 border-border/40">
        <CardHeader>
          <CardTitle className="text-lg font-medium">Your Gateway Endpoint</CardTitle>
          <p className="text-sm text-muted-foreground">
            Replace your provider URLs with this single endpoint
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex gap-3">
            <div className="flex-1">
              <Input
                value={proxyEndpoint}
                readOnly
                className="font-mono text-sm bg-background/50"
              />
            </div>
            <Button
              variant="secondary"
              onClick={copyProxyLink}
              className="shrink-0"
            >
              {copiedProxy ? "Copied" : "Copy"}
            </Button>
          </div>

          {/* Code Example */}
          <div className="rounded-lg bg-muted/30 p-4 border border-border/30">
            <p className="text-xs text-muted-foreground mb-3">Quick Start</p>
            <pre className="text-sm font-mono text-foreground/80 overflow-x-auto leading-relaxed">
{`import OpenAI from 'openai';

const client = new OpenAI({
  baseURL: '${proxyEndpoint}',
  apiKey: 'YOUR_SYNVERTAS_KEY',
});`}
            </pre>
          </div>
        </CardContent>
      </Card>

      {/* API Keys Vault */}
      <Card className="bg-card/50 border-border/40">
        <CardHeader>
          <CardTitle className="text-lg font-medium">API Key Vault</CardTitle>
          <p className="text-sm text-muted-foreground">
            Securely store your provider API keys. Encrypted at rest with AES-256.
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {apiProviders.map((provider) => (
              <div
                key={provider.id}
                className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-lg border border-border/30 bg-background/30"
              >
                {/* Provider Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3">
                    <span className="font-medium">{provider.provider}</span>
                    <Badge
                      variant="secondary"
                      className={`text-xs ${
                        provider.isConfigured
                          ? "bg-green-500/10 text-green-500"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {provider.isConfigured ? "Connected" : "Not configured"}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-0.5">{provider.name}</p>
                </div>

                {/* Key Input */}
                <div className="flex items-center gap-2 sm:w-80">
                  <div className="relative flex-1">
                    <Input
                      type={showKeys[provider.id] ? "text" : "password"}
                      value={keys[provider.id]}
                      onChange={(e) => handleKeyChange(provider.id, e.target.value)}
                      placeholder={`${provider.keyPrefix}...`}
                      className="font-mono text-sm pr-16"
                    />
                    <button
                      onClick={() => toggleKeyVisibility(provider.id)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showKeys[provider.id] ? "Hide" : "Show"}
                    </button>
                  </div>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => handleSaveKey(provider.id)}
                    disabled={!keys[provider.id]}
                  >
                    Save
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Integration Status */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="bg-card/50 border-border/40">
          <CardContent className="pt-6">
            <Label className="text-sm text-muted-foreground">Gateway Status</Label>
            <div className="flex items-center gap-2 mt-2">
              <div className="h-2 w-2 rounded-full bg-green-500" />
              <span className="text-lg font-semibold">Operational</span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              All systems running normally
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-border/40">
          <CardContent className="pt-6">
            <Label className="text-sm text-muted-foreground">Connected Providers</Label>
            <p className="text-lg font-semibold mt-2">
              {apiProviders.filter((p) => p.isConfigured).length} of {apiProviders.length}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              providers configured
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default GatewaySection;
