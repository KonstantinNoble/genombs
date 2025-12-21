import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lightbulb, Loader2 } from "lucide-react";

interface PostIdeaDialogProps {
  remainingPosts: number;
  onSubmit: (content: string, websiteUrl?: string) => Promise<boolean>;
  disabled?: boolean;
}

const MAX_CONTENT_LENGTH = 500;
const MAX_URL_LENGTH = 100;

const PostIdeaDialog = ({ remainingPosts, onSubmit, disabled }: PostIdeaDialogProps) => {
  const [open, setOpen] = useState(false);
  const [content, setContent] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!content.trim() || content.length > MAX_CONTENT_LENGTH) return;
    if (websiteUrl && (websiteUrl.length > MAX_URL_LENGTH || !websiteUrl.startsWith("https://"))) return;

    setIsSubmitting(true);
    const success = await onSubmit(content.trim(), websiteUrl.trim() || undefined);
    setIsSubmitting(false);

    if (success) {
      setContent("");
      setWebsiteUrl("");
      setOpen(false);
    }
  };

  const isValidUrl = !websiteUrl || (websiteUrl.startsWith("https://") && websiteUrl.length <= MAX_URL_LENGTH);
  const isValid = content.trim().length > 0 && 
                  content.length <= MAX_CONTENT_LENGTH && 
                  isValidUrl;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button disabled={disabled || remainingPosts <= 0} className="gap-2">
          <Lightbulb className="h-4 w-4" />
          Share Your Idea
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Share Your Business Idea</DialogTitle>
          <DialogDescription>
            Share your business idea with the community. Be creative and concise!
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="idea-content">Your Idea</Label>
            <Textarea
              id="idea-content"
              placeholder="Describe your business idea..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[120px] resize-none"
              maxLength={MAX_CONTENT_LENGTH}
            />
            <div className="flex justify-end">
              <span className={`text-xs ${content.length > MAX_CONTENT_LENGTH ? 'text-destructive' : 'text-muted-foreground'}`}>
                {content.length}/{MAX_CONTENT_LENGTH}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="website-url">Website URL (optional)</Label>
            <Input
              id="website-url"
              type="url"
              placeholder="https://example.com"
              value={websiteUrl}
              onChange={(e) => setWebsiteUrl(e.target.value)}
              maxLength={MAX_URL_LENGTH}
              className={websiteUrl && !websiteUrl.startsWith("https://") ? "border-destructive" : ""}
            />
            {websiteUrl && !websiteUrl.startsWith("https://") && (
              <p className="text-xs text-destructive">URL must start with https://</p>
            )}
            <p className="text-xs text-muted-foreground">
              {websiteUrl.length}/{MAX_URL_LENGTH} characters
            </p>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <p className="text-xs text-muted-foreground mr-auto">
            {remainingPosts}/2 posts remaining today
          </p>
          <Button
            onClick={handleSubmit}
            disabled={!isValid || isSubmitting || remainingPosts <= 0}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Posting...
              </>
            ) : (
              "Post Idea"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PostIdeaDialog;
