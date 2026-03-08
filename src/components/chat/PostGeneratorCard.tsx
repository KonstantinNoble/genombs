import { useState } from "react";
import { Send, Copy, Check, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { getPostCreditCost } from "@/lib/constants";
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "@/lib/supabase/external-client";

const PLATFORMS = [
  { id: "reddit", label: "Reddit", emoji: "🟠" },
  { id: "linkedin", label: "LinkedIn", emoji: "🔵" },
  { id: "x", label: "X / Twitter", emoji: "🐦" },
  { id: "youtube", label: "YouTube", emoji: "🔴" },
  { id: "facebook", label: "Facebook", emoji: "📘" },
  { id: "discord", label: "Discord", emoji: "💬" },
  { id: "tiktok", label: "TikTok", emoji: "🎵" },
  { id: "quora", label: "Quora", emoji: "❓" },
  { id: "forum", label: "Forum", emoji: "📝" },
  { id: "cold_email", label: "Cold Email / DM", emoji: "✉️" },
];

const TONES = [
  { id: "professional", label: "Professional" },
  { id: "casual", label: "Casual" },
  { id: "provocative", label: "Provocative" },
  { id: "educational", label: "Educational" },
];

const GOALS = [
  { id: "traffic", label: "Drive Traffic" },
  { id: "leads", label: "Generate Leads" },
  { id: "awareness", label: "Brand Awareness" },
  { id: "engagement", label: "Community Engagement" },
];

interface PostGeneratorCardProps {
  productContext: string;
  audienceContext?: any;
  selectedModel: string;
  accessToken: string;
}

const PostGeneratorCard = ({ productContext, audienceContext, selectedModel, accessToken }: PostGeneratorCardProps) => {
  const { remainingCredits, refreshCredits } = useAuth();
  const [platform, setPlatform] = useState("reddit");
  const [tone, setTone] = useState("casual");
  const [goal, setGoal] = useState("traffic");
  const [customContext, setCustomContext] = useState("");
  const [generatedContent, setGeneratedContent] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const creditCost = getPostCreditCost(selectedModel);
  const notEnoughCredits = remainingCredits < creditCost;

  const handleGenerate = async () => {
    if (isGenerating || notEnoughCredits) return;
    setIsGenerating(true);
    setGeneratedContent("");

    try {
      const resp = await fetch(`${SUPABASE_URL}/functions/v1/generate-post`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
          apikey: SUPABASE_ANON_KEY,
        },
        body: JSON.stringify({
          platform,
          tone,
          goal,
          product_context: customContext || productContext,
          audience_context: audienceContext,
          model: selectedModel,
        }),
      });

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({ error: "Generation failed" }));
        const msg = err.error || "Generation failed";
        if (msg.startsWith("insufficient_credits:")) {
          toast.error("Not enough credits");
        } else if (msg.startsWith("daily_limit_reached:")) {
          toast.error("Daily post limit reached");
        } else if (msg === "premium_model_required") {
          toast.error("This model requires Premium");
        } else {
          toast.error(msg);
        }
        setIsGenerating(false);
        return;
      }

      if (!resp.body) throw new Error("No response body");

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let content = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        let idx;
        while ((idx = buffer.indexOf("\n")) !== -1) {
          let line = buffer.slice(0, idx);
          buffer = buffer.slice(idx + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (!line.startsWith("data: ")) continue;
          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;

          try {
            const parsed = JSON.parse(jsonStr);
            const delta = parsed.choices?.[0]?.delta?.content;
            if (delta) {
              content += delta;
              setGeneratedContent(content);
            }
          } catch {}
        }
      }

      refreshCredits();
    } catch (e) {
      console.error("Post generation error:", e);
      toast.error("Post generation failed");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedContent);
    setCopied(true);
    toast.success("Post copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const selectedPlatform = PLATFORMS.find(p => p.id === platform);

  return (
    <Card className="border-primary/20 bg-card/80 overflow-hidden">
      <div className="p-4 border-b border-border/60">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <Send className="w-4 h-4 text-primary" />
          Post Generator
        </h3>
      </div>

      <div className="p-4 space-y-3">
        {/* Platform */}
        <div className="space-y-1.5">
          <Label className="text-xs">Platform</Label>
          <Select value={platform} onValueChange={setPlatform}>
            <SelectTrigger className="h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PLATFORMS.map(p => (
                <SelectItem key={p.id} value={p.id} className="text-xs">
                  {p.emoji} {p.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Tone + Goal in row */}
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1.5">
            <Label className="text-xs">Tone</Label>
            <Select value={tone} onValueChange={setTone}>
              <SelectTrigger className="h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TONES.map(t => (
                  <SelectItem key={t.id} value={t.id} className="text-xs">{t.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Goal</Label>
            <Select value={goal} onValueChange={setGoal}>
              <SelectTrigger className="h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {GOALS.map(g => (
                  <SelectItem key={g.id} value={g.id} className="text-xs">{g.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Optional custom context */}
        <div className="space-y-1.5">
          <Label className="text-xs">Custom Context (optional)</Label>
          <Textarea
            value={customContext}
            onChange={(e) => setCustomContext(e.target.value.slice(0, 500))}
            placeholder="Override or add to the product context..."
            className="text-xs min-h-[60px] max-h-[100px] resize-none"
            maxLength={500}
          />
        </div>

        {/* Generate Button */}
        <Button
          className="w-full h-8 text-xs"
          disabled={isGenerating || notEnoughCredits}
          onClick={handleGenerate}
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-3 h-3 mr-1.5 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              Generate {selectedPlatform?.emoji} {selectedPlatform?.label} Post ({creditCost} Credits)
            </>
          )}
        </Button>

        {notEnoughCredits && (
          <p className="text-[11px] text-destructive text-center">
            Not enough credits ({creditCost} needed, {remainingCredits} remaining)
          </p>
        )}
      </div>

      {/* Generated Content */}
      {generatedContent && (
        <div className="border-t border-border/60 p-4 space-y-2">
          <div className="flex items-center justify-between">
            <Badge variant="outline" className="text-[10px]">
              {selectedPlatform?.emoji} {selectedPlatform?.label}
            </Badge>
            <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={handleCopy}>
              {copied ? <Check className="w-3 h-3 mr-1" /> : <Copy className="w-3 h-3 mr-1" />}
              {copied ? "Copied" : "Copy"}
            </Button>
          </div>
          <div className="rounded-lg bg-muted/50 p-3">
            <pre className="text-xs text-foreground/90 whitespace-pre-wrap font-sans leading-relaxed">
              {generatedContent}
            </pre>
          </div>
        </div>
      )}
    </Card>
  );
};

export default PostGeneratorCard;
