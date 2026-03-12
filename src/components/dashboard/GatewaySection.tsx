import { useState } from "react";
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
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface APIKeyConfig {
  id: string;
  provider: string;
  name: string;
  keyPrefix: string;
  isConfigured: boolean;
  icon: string;
}

const apiProviders: APIKeyConfig[] = [
  {
    id: "openai",
    provider: "OpenAI",
    name: "GPT-4, GPT-3.5",
    keyPrefix: "sk-",
    isConfigured: true,
    icon: "O",
  },
  {
    id: "anthropic",
    provider: "Anthropic",
    name: "Claude 3, Claude 2",
    keyPrefix: "sk-ant-",
    isConfigured: true,
    icon: "A",
  },
  {
    id: "google",
    provider: "Google AI",
    name: "Gemini Pro, PaLM",
    keyPrefix: "AI",
    isConfigured: false,
    icon: "G",
  },
  {
    id: "mistral",
    provider: "Mistral AI",
    name: "Mistral Large, Medium",
    keyPrefix: "mk-",
    isConfigured: false,
    icon: "M",
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
      title: "Copied!",
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
    <div className="space-y-6">
      {/* Proxy Endpoint Section */}
      <Card className="glass-card border-primary/20">
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Link className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle>Your Gateway Endpoint</CardTitle>
              <CardDescription>
                Replace your provider URLs with this single endpoint
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Input
                value={proxyEndpoint}
                readOnly
                className="font-mono text-sm pr-10 bg-background/50"
              />
              <Badge
                variant="secondary"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-xs"
              >
                HTTPS
              </Badge>
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={copyProxyLink}
              className="shrink-0"
            >
              {copiedProxy ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>

          {/* Code Example */}
          <div className="rounded-lg bg-muted/50 p-4 border border-border/50">
            <p className="text-xs text-muted-foreground mb-2">Quick Start Example</p>
            <pre className="text-xs font-mono text-foreground/80 overflow-x-auto">
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
      <Card className="glass-card">
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Shield className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle>API Key Vault</CardTitle>
              <CardDescription>
                Securely store your provider API keys. They are encrypted at rest.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {apiProviders.map((provider) => (
              <div
                key={provider.id}
                className="flex items-center gap-4 p-4 rounded-lg border border-border/50 bg-background/30 hover:border-border transition-colors"
              >
                {/* Provider Icon */}
                <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                  <span className="text-sm font-bold text-foreground">
                    {provider.icon}
                  </span>
                </div>

                {/* Provider Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{provider.provider}</span>
                    {provider.isConfigured ? (
                      <Badge
                        variant="secondary"
                        className="text-xs bg-green-500/10 text-green-500 border-green-500/20"
                      >
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Connected
                      </Badge>
                    ) : (
                      <Badge
                        variant="secondary"
                        className="text-xs bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
                      >
                        <AlertCircle className="h-3 w-3 mr-1" />
                        Not configured
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">{provider.name}</p>
                </div>

                {/* Key Input */}
                <div className="flex items-center gap-2 w-80">
                  <div className="relative flex-1">
                    <Key className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type={showKeys[provider.id] ? "text" : "password"}
                      value={keys[provider.id]}
                      onChange={(e) => handleKeyChange(provider.id, e.target.value)}
                      placeholder={`${provider.keyPrefix}...`}
                      className="pl-9 pr-9 font-mono text-xs"
                    />
                    <button
                      onClick={() => toggleKeyVisibility(provider.id)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showKeys[provider.id] ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
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

          {/* Security Note */}
          <div className="mt-6 p-4 rounded-lg bg-muted/30 border border-border/50">
            <div className="flex items-start gap-3">
              <Shield className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium">Security First</p>
                <p className="text-xs text-muted-foreground mt-1">
                  All API keys are encrypted using AES-256 before storage. Keys are
                  never logged and are only decrypted in-memory when making API calls.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Integration Status */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="glass-card">
          <CardContent className="pt-6">
            <Label className="text-sm text-muted-foreground">Gateway Status</Label>
            <div className="flex items-center gap-2 mt-2">
              <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-lg font-semibold">Operational</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              All systems running normally
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="pt-6">
            <Label className="text-sm text-muted-foreground">Connected Providers</Label>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-lg font-semibold">
                {apiProviders.filter((p) => p.isConfigured).length} of {apiProviders.length}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              providers configured
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default GatewaySection;
