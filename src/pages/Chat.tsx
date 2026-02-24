import { useState } from "react";
import { PanelLeftOpen, PanelLeftClose, LayoutDashboard, MessageSquare, Loader2, CheckCircle2, Code } from "lucide-react";
import CreditResetTimer from "@/components/chat/CreditResetTimer";
import { Progress } from "@/components/ui/progress";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import SectionNavBar from "@/components/dashboard/SectionNavBar";
import Navbar from "@/components/Navbar";
import ChatSidebar from "@/components/chat/ChatSidebar";
import ChatMessage from "@/components/chat/ChatMessage";
import ChatInput from "@/components/chat/ChatInput";
import AnalysisProgress from "@/components/chat/AnalysisProgress";
import InlineUrlPrompt from "@/components/chat/InlineUrlPrompt";
import AnalysisTabsContent from "@/components/dashboard/AnalysisTabs";
import { useIsMobile } from "@/hooks/use-mobile";
import MobileBlocker from "@/components/MobileBlocker";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

// Import Custom Hooks
import { useChatConversations } from "@/hooks/useChatConversations";
import { useChatAnalysis } from "@/hooks/useChatAnalysis";
import { useChatMessages } from "@/hooks/useChatMessages";

import { saveMessage, findCompetitors, analyzeWebsite, loadMessages } from "@/lib/api/chat-api";
import type { WebsiteProfile } from "@/types/chat";
import { FREE_MAX_URL_FIELDS, PREMIUM_MAX_URL_FIELDS, getAnalysisCreditCost } from "@/lib/constants";

const Chat = () => {
  const isMobile = useIsMobile();
  const { user, isLoading: authLoading, remainingCredits, creditsLimit, creditsResetAt, refreshCredits, isPremium } = useAuth();

  // 1. Conversation Management
  const {
    conversations,
    setConversations,
    activeId,
    setActiveId,
    deleteDialogState,
    setDeleteDialogState,
    handleNewConversation,
    handleOpenDeleteDialog,
    handleConfirmDelete,
    getAccessToken,
  } = useChatConversations(user?.id);

  // 2. We need to define onSummaryRequired for the Analysis hook
  // which will actually call generateSummary from the Messages hook.
  // Since they depend on each other, we pass a callback.
  const [triggerSummaryTask, setTriggerSummaryTask] = useState<{
    completed: WebsiteProfile[];
    accessToken: string;
    model?: string;
  } | null>(null);

  // 3. Analysis Management
  const {
    profiles,
    setProfiles,
    tasks,
    isAnalyzing,
    showInlineUrlPrompt,
    setShowInlineUrlPrompt,
    deduplicateProfiles,
    handleScan,
    loadProfiles,
  } = useChatAnalysis({
    activeId,
    userId: user?.id,
    getAccessToken,
    setConversations,
    onSummaryRequired: (completed, token, model) => {
      setTriggerSummaryTask({ completed, accessToken: token, model });
    },
    onCompetitorSearchRequired: () => {
      handleFindCompetitors();
    },
    isPremium,
    refreshCredits,
  });

  // 4. Message Management
  const {
    messages,
    setMessages,
    isStreaming,
    scrollRef,
    handleSend,
    handleGithubDeepAnalysis,
    generateSummary,
    codeAnalysisProgress,
  } = useChatMessages({
    activeId,
    getAccessToken,
    profiles,
    setProfiles,
    refreshCredits,
    deduplicateProfiles,
    loadProfiles,
    isPremium,
  });

  // Call generateSummary when triggered
  if (triggerSummaryTask) {
    generateSummary(triggerSummaryTask.completed, triggerSummaryTask.accessToken, triggerSummaryTask.model);
    setTriggerSummaryTask(null);
  }

  // UI State
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mobileView, setMobileView] = useState<"chat" | "dashboard">("chat");
  const [urlDialogOpen, setUrlDialogOpen] = useState(false);
  const [githubDialogOpen, setGithubDialogOpen] = useState(false);
  const [isFindingCompetitors, setIsFindingCompetitors] = useState(false);
  const [selectedModel, setSelectedModel] = useState("gemini-flash");

  // Competitor URL limits: free→1, premium→3
  const maxCompetitorSelectable = isPremium ? PREMIUM_MAX_URL_FIELDS - 1 : FREE_MAX_URL_FIELDS - 1;

  // Handler: Find competitors via Perplexity
  const handleFindCompetitors = async () => {
    if (!activeId || !user) return;
    setIsFindingCompetitors(true);
    try {
      const token = await getAccessToken();
      await findCompetitors(activeId, token);
      // Reload messages to show the new competitor_suggestions message
      const updatedMessages = await loadMessages(activeId);
      setMessages(updatedMessages);
      refreshCredits();
    } catch (e: any) {
      const msg = e.message || "Competitor search failed";
      if (msg.startsWith("insufficient_credits:")) {
        const hours = msg.split(":")[1];
        if (isPremium) {
          toast.error("Daily credit limit reached", {
            description: `Competitor search requires more credits. Resets in ${hours}h.`,
            duration: 6000,
          });
        } else {
          toast.error("Daily credit limit reached", {
            description: `AI-powered competitor discovery finds your top rivals and analyzes their strengths. Upgrade to Premium for 100 daily credits. Resets in ${hours}h.`,
            duration: 10000,
            action: {
              label: "View Plans",
              onClick: () => window.location.href = "/pricing",
            },
          });
        }
      } else {
        toast.error(msg);
      }
    } finally {
      setIsFindingCompetitors(false);
    }
  };

  // Handler: Analyze selected competitors from suggestions
  const handleAnalyzeSelectedCompetitors = async (urls: string[]) => {
    if (!activeId || !user || urls.length === 0) return;
    const limitedUrls = urls.slice(0, maxCompetitorSelectable);

    // Pre-validate credits before starting any scans
    const costPerUrl = getAnalysisCreditCost(selectedModel);
    const totalCost = limitedUrls.length * costPerUrl;

    if (remainingCredits < totalCost) {
      const affordable = Math.floor(remainingCredits / costPerUrl);
      toast.error("Not enough credits", {
        description: `You need ${totalCost} credits for ${limitedUrls.length} scans, but only have ${remainingCredits}. You can afford ${affordable} scan${affordable !== 1 ? "s" : ""}.`,
        duration: 6000,
      });
      return;
    }

    const token = await getAccessToken();
    try {
      await Promise.all(
        limitedUrls.map((url) => analyzeWebsite(url, activeId, false, token, selectedModel))
      );
      toast.success(`Analyzing ${limitedUrls.length} competitor${limitedUrls.length > 1 ? "s" : ""}...`);
      refreshCredits();
    } catch (e: any) {
      const msg = e.message || "Analysis failed";
      if (msg.startsWith("insufficient_credits:")) {
        const hours = msg.split(":")[1];
        if (isPremium) {
          toast.error("Daily credit limit reached", {
            description: `Competitor analysis requires more credits. Resets in ${hours}h.`,
            duration: 6000,
          });
        } else {
          toast.error("Daily credit limit reached", {
            description: `Competitor analysis reveals how rivals compare on SEO, mobile, trust & more. Upgrade to Premium for 100 daily credits. Resets in ${hours}h.`,
            duration: 10000,
            action: {
              label: "View Plans",
              onClick: () => window.location.href = "/pricing",
            },
          });
        }
      } else {
        toast.error(msg);
      }
    }
  };

  // Handlers for UI to use
  const onStartScan = async (ownUrl: string, competitorUrls: string[], model?: string, githubRepoUrl?: string, autoFindCompetitors?: boolean) => {
    await handleScan(
      ownUrl,
      competitorUrls,
      model,
      githubRepoUrl,
      async (content) => {
        if (!activeId) return;
        const msg = await saveMessage(activeId, "user", content);
        setMessages((prev) => [...prev, msg]);
      },
      refreshCredits,
      autoFindCompetitors
    );
  };

  const sidebarConversations = conversations.map((c) => ({
    id: c.id,
    title: c.title,
    messages: [] as { id: string; role: "user" | "assistant"; content: string; createdAt: string }[],
    createdAt: c.created_at,
  }));

  const activeConversation = conversations.find((c) => c.id === activeId) || null;
  const completedProfiles = profiles.filter((p) => p.status === "completed");
  const hasProfiles = completedProfiles.length > 0;
  const pendingProfiles = profiles.filter((p) => p.status !== "completed" && p.status !== "error");

  if (isMobile) {
    return <MobileBlocker />;
  }

  if (authLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-background/60">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="h-screen flex flex-col bg-background/60">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <h2 className="text-lg font-medium text-foreground">Sign in to start analyzing</h2>
            <p className="text-sm text-muted-foreground">You need an account to use the chat.</p>
          </div>
        </div>
      </div>
    );
  }

  const creditPercent = creditsLimit > 0 ? (remainingCredits / creditsLimit) * 100 : 0;
  const creditColor =
    remainingCredits <= 0 ? "text-destructive" : remainingCredits < 5 ? "text-chart-4" : "text-primary";

  const chatHeader = (
    <div className="border-b border-border/60 bg-card px-4 py-2.5 flex items-center gap-3">
      <Button variant="ghost" size="icon" className="md:hidden shrink-0 h-7 w-7" onClick={() => setSidebarOpen(true)}>
        {sidebarOpen ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeftOpen className="w-4 h-4" />}
      </Button>
      {isMobile && (
        <Button
          variant="ghost"
          size="icon"
          className="shrink-0 h-7 w-7"
          onClick={() => setMobileView(mobileView === "chat" ? "dashboard" : "chat")}
        >
          {mobileView === "chat" ? <LayoutDashboard className="w-4 h-4" /> : <MessageSquare className="w-4 h-4" />}
        </Button>
      )}
      <div className="min-w-0 flex-1">
        <h2 className="text-base font-semibold tracking-tight text-foreground truncate">
          {activeConversation?.title || "Select a conversation"}
        </h2>
        {activeConversation && (
          <p className="text-xs text-muted-foreground/60 mt-0.5">
            {messages.length} messages{isAnalyzing && " · analyzing..."}
          </p>
        )}
      </div>
      <div className="shrink-0 flex items-center gap-3 ml-auto">
        <span className={`font-mono text-sm ${creditColor} tabular-nums`}>
          <span className="text-muted-foreground/40 mr-0.5">[</span>
          {remainingCredits}<span className="text-muted-foreground/50">/</span>{creditsLimit}
          <span className="text-muted-foreground/40 ml-0.5"> credits]</span>
        </span>
        <CreditResetTimer creditsResetAt={creditsResetAt} />
      </div>
    </div>
  );

  const chatPanel = (
    <div className="flex-1 flex flex-col min-w-0 h-full">
      {chatHeader}
      {isMobile ? (
        <div className="flex-1 overflow-y-auto overflow-x-hidden">
          <div className="max-w-3xl mx-auto p-4 space-y-4">
            {messages.length === 0 && activeId && (
              <div className="flex flex-col items-center justify-center h-64 gap-2">
                <span className="text-muted-foreground/60 text-lg font-medium">Start a conversation</span>
                <span className="text-muted-foreground/40 text-sm">Enter a URL or ask a question below</span>
              </div>
            )}
            {messages.map((msg) => (
              <ChatMessage key={msg.id} message={msg} onAnalyzeCompetitors={handleAnalyzeSelectedCompetitors} competitorAnalysisDisabled={isAnalyzing} maxCompetitorSelectable={maxCompetitorSelectable} />
            ))}
            {isStreaming && (
              <div className="flex justify-start">
                <div className="bg-card border border-border rounded-2xl rounded-bl-md px-4 py-3 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-muted-foreground/60 animate-bounce [animation-delay:0ms]" />
                  <span className="w-2 h-2 rounded-full bg-muted-foreground/60 animate-bounce [animation-delay:150ms]" />
                  <span className="w-2 h-2 rounded-full bg-muted-foreground/60 animate-bounce [animation-delay:300ms]" />
                </div>
              </div>
            )}
            <div ref={scrollRef} />
          </div>
        </div>
      ) : (
        <ScrollArea className="flex-1">
          <div className="max-w-3xl mx-auto p-4 space-y-4">
            {messages.length === 0 && activeId && (
              <div className="flex flex-col items-center justify-center h-64 gap-2">
                <span className="text-muted-foreground/60 text-lg font-medium">Start a conversation</span>
                <span className="text-muted-foreground/40 text-sm">Enter a URL or ask a question below</span>
              </div>
            )}
            {messages.map((msg) => (
              <ChatMessage key={msg.id} message={msg} onAnalyzeCompetitors={handleAnalyzeSelectedCompetitors} competitorAnalysisDisabled={isAnalyzing} maxCompetitorSelectable={maxCompetitorSelectable} />
            ))}
            {showInlineUrlPrompt && !hasProfiles && (
              <InlineUrlPrompt
                onStartAnalysis={(ownUrl, competitorUrls, model, _ghUrl, autoFindCompetitors) => {
                  setShowInlineUrlPrompt(false);
                  onStartScan(ownUrl, competitorUrls, model, undefined, autoFindCompetitors);
                }}
                onGithubOnlyAnalysis={(githubUrl, model) => {
                  setShowInlineUrlPrompt(false);
                  handleGithubDeepAnalysis(githubUrl, user?.id, model);
                }}
                selectedModel={selectedModel}
              />
            )}
            {isFindingCompetitors && (
              <div className="flex justify-start">
                <div className="bg-card border border-border rounded-2xl rounded-bl-md px-4 py-3 flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-primary" />
                  <span className="text-sm text-muted-foreground">Searching for competitors...</span>
                </div>
              </div>
            )}
            {isStreaming && (
              <div className="flex justify-start">
                <div className="bg-card border border-border rounded-2xl rounded-bl-md px-4 py-3 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-muted-foreground/60 animate-bounce [animation-delay:0ms]" />
                  <span className="w-2 h-2 rounded-full bg-muted-foreground/60 animate-bounce [animation-delay:150ms]" />
                  <span className="w-2 h-2 rounded-full bg-muted-foreground/60 animate-bounce [animation-delay:300ms]" />
                </div>
              </div>
            )}
            <div ref={scrollRef} />
          </div>
        </ScrollArea>
      )}
      {profiles.some((p) => p.status !== "completed" && p.status !== "error") && (
        <AnalysisProgress profiles={profiles} />
      )}
      {codeAnalysisProgress && (
        <div className="mx-auto max-w-3xl w-full px-4 pb-3">
          <div className="rounded-lg border border-border bg-card p-4 space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
              {codeAnalysisProgress.phase === "Done" ? (
                <CheckCircle2 className="w-4 h-4 text-chart-6" />
              ) : (
                <Loader2 className="w-4 h-4 animate-spin text-primary" />
              )}
              Deep Code Analysis
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5">
                  <Code className="w-3 h-3 text-muted-foreground" />
                  GitHub Repository
                </span>
                <span className={codeAnalysisProgress.phase === "Done" ? "text-chart-6" : "text-primary"}>
                  {codeAnalysisProgress.phase}
                </span>
              </div>
              <Progress value={codeAnalysisProgress.percent} className="h-1.5" />
            </div>
          </div>
        </div>
      )}
      <div className="max-w-3xl mx-auto w-full">
        <ChatInput
          onSend={(content, model) => handleSend(content, user?.id, model)}
          onScan={(ownUrl, compUrls, model, repo, autoFind) => onStartScan(ownUrl, compUrls, model, repo, autoFind)}
          onGithubAnalysis={(url, model) => handleGithubDeepAnalysis(url, user?.id, model)}
          onModelChange={(model) => setSelectedModel(model)}
          onPromptUrl={async (message) => {
            if (!activeId) return;
            try {
              const userMsg = await saveMessage(activeId, "user", message);
              setMessages((prev) => [...prev, userMsg]);
            } catch (e) {
              console.error("Failed to save message:", e);
            }
            setShowInlineUrlPrompt(true);
          }}
          disabled={!activeId || isStreaming}
          hasProfiles={profiles.length > 0}
          hasOwnProfile={true}
          initialOwnUrl={profiles.find((p) => p.is_own_website)?.url}
          initialCompetitorUrls={profiles.filter((p) => !p.is_own_website).map((p) => p.url)}
          externalDialogOpen={urlDialogOpen}
          onExternalDialogChange={setUrlDialogOpen}
          externalGithubOpen={githubDialogOpen}
          onExternalGithubChange={setGithubDialogOpen}
        />
      </div>
    </div>
  );

  const dashboardPanel = (
    <div className="h-full flex flex-col">
      <div className="border-b border-border/60 bg-card px-4 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold tracking-widest text-muted-foreground/50 uppercase select-none">Workspace</span>
          <a href="/dashboard" className="text-[10px] text-primary hover:underline font-medium tracking-wide uppercase">View Dashboard</a>
        </div>
        {completedProfiles.length > 0 && (
          <span className="text-xs text-muted-foreground/40">{completedProfiles.length} url{completedProfiles.length > 1 ? "s" : ""} analyzed</span>
        )}
      </div>
      {hasProfiles && (
        <SectionNavBar
          hasCodeAnalysis={completedProfiles.some((p) => p.is_own_website && !!p.code_analysis)}
          hasWebsiteAnalysis={completedProfiles.some((p) => p.is_own_website && !!p.profile_data)}
        />
      )}

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          {pendingProfiles.length > 0 && (
            <div className="space-y-2">
              {pendingProfiles.map((p) => (
                <div key={p.id} className="flex items-center gap-3 p-3 rounded-lg border border-border bg-card">
                  <Loader2 className="w-4 h-4 animate-spin text-primary shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{p.url}</p>
                    <p className="text-[11px] text-muted-foreground capitalize">
                      {p.status === "crawling" ? "Crawling website..." : p.status === "analyzing" ? "AI analyzing..." : p.status}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {profiles
            .filter((p) => p.status === "error")
            .map((p) => (
              <div key={p.id} className="flex items-center gap-3 p-3 rounded-lg border border-destructive/30 bg-destructive/5">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{p.url}</p>
                  <p className="text-[11px] text-destructive">{p.error_message || "Analysis failed"}</p>
                </div>
              </div>
            ))}

          {hasProfiles && <AnalysisTabsContent profiles={completedProfiles} tasks={tasks} onOpenUrlDialog={() => setUrlDialogOpen(true)} onOpenGithubDialog={() => setGithubDialogOpen(true)} />}

          {!hasProfiles &&
            pendingProfiles.length === 0 &&
            profiles.filter((p) => p.status === "error").length === 0 &&
            (isAnalyzing ? (
              <div className="flex flex-col items-center justify-center h-40 gap-3 text-muted-foreground">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
                <p className="text-sm animate-pulse-subtle">Preparing analysis...</p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-40 gap-3 text-muted-foreground">
                <LayoutDashboard className="w-8 h-8 text-muted-foreground/30" />
                <p className="text-sm">Start an analysis to see results here</p>
              </div>
            ))}
        </div>
      </ScrollArea>
    </div>
  );

  return (
    <div className="h-screen flex flex-col bg-background/60">
      <Navbar />
      <div className="flex-1 flex overflow-hidden">
        {/* Desktop Sidebar */}
        <div className="hidden md:block w-72 shrink-0">
          <ChatSidebar
            conversations={sidebarConversations}
            activeId={activeId}
            onSelect={(id) => {
              setActiveId(id);
              if (isMobile) setSidebarOpen(false);
            }}
            onNew={() => handleNewConversation(() => setSidebarOpen(false))}
            onDelete={handleOpenDeleteDialog}
          />
        </div>

        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-50 md:hidden">
            <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
            <div className="relative w-72 h-full">
              <ChatSidebar
                conversations={sidebarConversations}
                activeId={activeId}
                onSelect={(id) => {
                  setActiveId(id);
                  setSidebarOpen(false);
                }}
                onNew={() => handleNewConversation(() => setSidebarOpen(false))}
                onDelete={handleOpenDeleteDialog}
              />
            </div>
          </div>
        )}

        {/* Main Content */}
        {isMobile ? (
          <div className="flex-1 flex flex-col min-w-0">{mobileView === "chat" ? chatPanel : dashboardPanel}</div>
        ) : (
          <ResizablePanelGroup direction="horizontal" className="flex-1">
            <ResizablePanel defaultSize={55} minSize={30}>
              {chatPanel}
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize={45} minSize={25}>
              {dashboardPanel}
            </ResizablePanel>
          </ResizablePanelGroup>
        )}
      </div>

      <AlertDialog
        open={deleteDialogState.isOpen}
        onOpenChange={(open) => !open && setDeleteDialogState({ isOpen: false, conversationId: null })}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete conversation?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The conversation and all associated data will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Chat;
