import { useState } from "react";
import { Send, Copy, Check, Loader2, Users, RefreshCw } from "lucide-react";
import ReactMarkdown from "react-markdown";
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
import { generatePost } from "@/lib/api/chat-api";
import { supabase } from "@/lib/supabase/external-client";

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
  onSwitchToCustomerSearch?: () => void;
  onPostGenerated?: (content: string, platform: string, tone: string, goal: string) => void;
}

const PostGeneratorCard = ({ productContext, audienceContext, selectedModel, onSwitchToCustomerSearch, onPostGenerated }: PostGeneratorCardProps) => {
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
  const hasAudienceContext = audienceContext && Object.keys(audienceContext).length > 0;

  const handleGenerate = async () => {
    if (isGenerating || notEnoughCredits) return;
    setIsGenerating(true);
    setGeneratedContent("");

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token || "";

      let content = "";
      await generatePost({
        platform,
        tone,
        goal,
        productContext: customContext || productContext,
        audienceContext,
        model: selectedModel,
        accessToken: token,
        onDelta: (delta) => {
          content += delta;
          setGeneratedContent(content);
        },
        onDone: () => {
          if (content && onPostGenerated) {
            onPostGenerated(content, platform, tone, goal);
          }
        },
      });

      refreshCredits();
    } catch (e: any) {
      const msg = e.message || "Generation failed";
      if (msg.startsWith("insufficient_credits:")) {
        toast.error("Not enough credits");
      } else if (msg.startsWith("daily_limit_reached:")) {
        toast.error("Daily post limit reached");
      } else if (msg === "premium_model_required") {
        toast.error("This model requires Premium");
      } else {
        toast.error(msg);
      }
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
        {/* Audience Context Indicator */}
        {hasAudienceContext ? (
          <div className="rounded-md bg-chart-6/10 border border-chart-6/20 p-2.5 flex items-center gap-2">
            <Users className="w-3.5 h-3.5 text-chart-6 shrink-0" />
            <p className="text-[11px] text-foreground/80">
              <span className="font-medium text-chart-6">Audience context loaded</span> — Posts will be tailored to your customer map's ICP and communities.
            </p>
          </div>
        ) : (
          <div className="rounded-md bg-muted/50 border border-border/60 p-2.5 flex items-center justify-between gap-2">
            <p className="text-[11px] text-muted-foreground">
              💡 Run <span className="font-medium">Find Customers</span> first for better targeting
            </p>
            {onSwitchToCustomerSearch && (
              <Button variant="ghost" size="sm" className="h-6 text-[10px] px-2 text-primary" onClick={onSwitchToCustomerSearch}>
                Find Customers →
              </Button>
            )}
          </div>
        )}

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
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                className="h-6 text-xs"
                disabled={isGenerating || notEnoughCredits}
                onClick={handleGenerate}
              >
                <RefreshCw className="w-3 h-3 mr-1" />
                Regenerate
              </Button>
              <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={handleCopy}>
                {copied ? <Check className="w-3 h-3 mr-1" /> : <Copy className="w-3 h-3 mr-1" />}
                {copied ? "Copied" : "Copy"}
              </Button>
            </div>
          </div>
          <div className="rounded-lg bg-muted/50 p-3 prose prose-sm prose-invert max-w-none prose-p:text-foreground/90 prose-headings:text-foreground prose-strong:text-foreground prose-a:text-primary">
            <ReactMarkdown>{generatedContent}</ReactMarkdown>
          </div>
        </div>
      )}
    </Card>
  );
};

export default PostGeneratorCard;
