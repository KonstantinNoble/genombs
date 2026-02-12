import { useState, useEffect, useRef, useCallback } from "react";
import { PanelLeftOpen, PanelLeftClose, LayoutDashboard, MessageSquare, Loader2 } from "lucide-react";
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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import ChatSidebar from "@/components/chat/ChatSidebar";
import ChatMessage from "@/components/chat/ChatMessage";
import ChatInput from "@/components/chat/ChatInput";
import AnalysisProgress from "@/components/chat/AnalysisProgress";
import WebsiteGrid from "@/components/dashboard/WebsiteGrid";
import ComparisonTable from "@/components/dashboard/ComparisonTable";
import AnalysisTabsContent from "@/components/dashboard/AnalysisTabs";
import ImprovementPlan from "@/components/dashboard/ImprovementPlan";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase/external-client";
import {
  loadConversations,
  createConversation,
  loadMessages,
  saveMessage,
  loadProfiles,
  loadTasks,
  analyzeWebsite,
  streamChat,
  deleteProfilesForConversation,
  deleteConversation,
} from "@/lib/api/chat-api";
import type { Conversation, Message, WebsiteProfile, ImprovementTask } from "@/types/chat";

const MAX_CONVERSATIONS = 20;

const Chat = () => {
  const isMobile = useIsMobile();
  const { user, isLoading: authLoading } = useAuth();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [profiles, setProfiles] = useState<WebsiteProfile[]>([]);
  const [tasks, setTasks] = useState<ImprovementTask[]>([]);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mobileView, setMobileView] = useState<"chat" | "dashboard">("chat");
  const [analysisTab, setAnalysisTab] = useState("overview");
  const [isStreaming, setIsStreaming] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const [deleteDialogState, setDeleteDialogState] = useState<{ isOpen: boolean; conversationId: string | null }>({ isOpen: false, conversationId: null });

  const scrollRef = useRef<HTMLDivElement>(null);

  // ─── Load conversations on mount ───
  useEffect(() => {
    if (!user) return;
    loadConversations(user.id)
      .then((convs) => {
        setConversations(convs);
        if (convs.length > 0) setActiveId(convs[0].id);
      })
      .catch((e) => console.error("Failed to load conversations:", e));
  }, [user]);

  // ─── Load messages + profiles when active conversation changes ───
  useEffect(() => {
    if (!activeId) {
      setMessages([]);
      setProfiles([]);
      setTasks([]);
      return;
    }

    loadMessages(activeId)
      .then(setMessages)
      .catch((e) => console.error("Failed to load messages:", e));

    loadProfiles(activeId)
      .then((ps) => {
        setProfiles(ps);
        const completedIds = ps.filter((p) => p.status === "completed").map((p) => p.id);
        if (completedIds.length > 0) {
          loadTasks(completedIds).then(setTasks).catch(console.error);
        } else {
          setTasks([]);
        }
      })
      .catch((e) => console.error("Failed to load profiles:", e));
  }, [activeId]);

  // ─── Realtime pause flag ───
  const realtimePausedRef = useRef(false);

  // ─── Deduplicate profiles by URL (keep newest) ───
  const deduplicateProfiles = useCallback((ps: WebsiteProfile[]): WebsiteProfile[] => {
    const byUrl = new Map<string, WebsiteProfile>();
    for (const p of ps) {
      const existing = byUrl.get(p.url);
      if (!existing || new Date(p.created_at) > new Date(existing.created_at)) {
        byUrl.set(p.url, p);
      }
    }
    return Array.from(byUrl.values());
  }, []);

  // ─── Realtime subscription for website_profiles ───
  useEffect(() => {
    if (!activeId || !user) return;

    const channel = supabase
      .channel(`profiles_${activeId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "website_profiles",
          filter: `conversation_id=eq.${activeId}`,
        },
        () => {
          if (realtimePausedRef.current) return;
          // Reload profiles on any change
          loadProfiles(activeId).then((ps) => {
            const deduped = deduplicateProfiles(ps);
            setProfiles(deduped);
            const completedIds = deduped.filter((p) => p.status === "completed").map((p) => p.id);
            if (completedIds.length > 0) {
              loadTasks(completedIds).then(setTasks).catch(console.error);
            }
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeId, user, deduplicateProfiles]);

  // ─── Scroll to bottom on initial messages load only ───
  useEffect(() => {
    if (messages.length === 0) return;
    // Only scroll on initial load, not on every message update
    const timer = setTimeout(() => {
      scrollRef.current?.scrollIntoView({ behavior: "auto" });
    }, 0);
    return () => clearTimeout(timer);
  }, [activeId]);

  // ─── Get access token ───
  const getAccessToken = useCallback(async () => {
    const { data } = await supabase.auth.getSession();
    return data.session?.access_token ?? "";
  }, []);

  // ─── New conversation ───
  const handleNewConversation = async () => {
    if (!user) return;
    try {
      const conv = await createConversation(user.id);
      const updated = [conv, ...conversations];
      setConversations(updated);
      setActiveId(conv.id);
      setSidebarOpen(false);

      // Enforce max 20 conversations: delete oldest if exceeded
      if (updated.length > MAX_CONVERSATIONS) {
        const oldest = updated[updated.length - 1]; // sorted by updated_at desc
        try {
          const token = await getAccessToken();
          await deleteConversation(oldest.id, token);
          setConversations((prev) => prev.filter((c) => c.id !== oldest.id));
          console.log(`Auto-deleted oldest conversation: ${oldest.id}`);
        } catch (delErr) {
          console.error("Failed to auto-delete oldest conversation:", delErr);
        }
      }
    } catch (e) {
      toast.error("Failed to create conversation");
      console.error(e);
    }
  };

  // ─── Delete conversation manually ───
  const handleOpenDeleteDialog = (id: string) => {
    setDeleteDialogState({ isOpen: true, conversationId: id });
  };

  const handleConfirmDelete = async () => {
    const id = deleteDialogState.conversationId;
    setDeleteDialogState({ isOpen: false, conversationId: null });
    if (!id) return;
    try {
      const token = await getAccessToken();
      await deleteConversation(id, token);
      setConversations((prev) => prev.filter((c) => c.id !== id));
      if (activeId === id) {
        const remaining = conversations.filter((c) => c.id !== id);
        setActiveId(remaining.length > 0 ? remaining[0].id : null);
      }
      toast.success("Conversation deleted");
    } catch (e) {
      toast.error("Failed to delete conversation");
      console.error(e);
    }
  };

  // ─── Send message + stream response ───
  const handleSend = async (content: string, model?: string) => {
    if (!activeId || !user || isStreaming) return;

    try {
      // Save user message to DB
      const userMsg = await saveMessage(activeId, "user", content);
      setMessages((prev) => [...prev, userMsg]);

      // Start streaming
      setIsStreaming(true);
      const token = await getAccessToken();

      const chatHistory = [...messages, userMsg].map((m) => ({
        role: m.role,
        content: m.content,
      }));

      let assistantContent = "";

      // Add placeholder assistant message
      const tempId = `temp-${Date.now()}`;
      setMessages((prev) => [
        ...prev,
        { id: tempId, conversation_id: activeId, role: "assistant", content: "", created_at: new Date().toISOString() },
      ]);

      await streamChat({
        messages: chatHistory,
        conversationId: activeId,
        accessToken: token,
        model,
        onDelta: (delta) => {
          assistantContent += delta;
          setMessages((prev) =>
            prev.map((m) => (m.id === tempId ? { ...m, content: assistantContent } : m))
          );
        },
        onDone: () => {},
      });

      // Save final assistant message to DB
      const savedAssistant = await saveMessage(activeId, "assistant", assistantContent);
      // Replace temp message with saved one
      setMessages((prev) => prev.map((m) => (m.id === tempId ? savedAssistant : m)));
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Chat failed";
      toast.error(msg);
      console.error(e);
    } finally {
      setIsStreaming(false);
    }
  };

  // ─── Start analysis (scan) ───
  const handleScan = async (ownUrl: string, competitorUrls: string[], model?: string) => {
    if (!activeId || !user) return;

    setIsAnalyzing(true);
    const token = await getAccessToken();

    // Add a user message describing the scan
    const content = `Analyze my site ${ownUrl} vs competitors: ${competitorUrls.join(", ")}`;
    try {
      const userMsg = await saveMessage(activeId, "user", content);
      setMessages((prev) => [...prev, userMsg]);
    } catch (e) {
      console.error("Failed to save scan message:", e);
    }

    // Pause realtime during delete+insert cycle
    realtimePausedRef.current = true;

    // Clean up old profiles and tasks before starting new analysis
    try {
      const result = await deleteProfilesForConversation(activeId, token);
      console.log(`Cleanup complete: ${result.deletedProfiles} profiles, ${result.deletedTasks} task groups removed`);
    } catch (e) {
      console.error("Failed to delete old profiles:", e);
      toast.error("Failed to delete old analysis data. Please try again.");
      realtimePausedRef.current = false;
      setIsAnalyzing(false);
      return; // Stop — don't continue with new analysis
    }
    setProfiles([]);
    setTasks([]);

    // Resume realtime after a short delay to let inserts settle
    setTimeout(() => {
      realtimePausedRef.current = false;
    }, 2000);

    // Fire all analysis requests in parallel
    const allUrls = [
      { url: ownUrl, isOwn: true },
      ...competitorUrls.map((u) => ({ url: u, isOwn: false })),
    ];

    try {
      await Promise.all(
        allUrls.map(({ url, isOwn }) =>
          analyzeWebsite(url, activeId, isOwn, token, model).catch((e) => {
            toast.error(`Analysis failed for ${url}: ${e.message}`);
          })
        )
      );
      toast.success("Analysis started! Results will appear in the dashboard.");

      // Wait for realtime updates, then generate AI summary
      setTimeout(async () => {
        try {
          const freshProfiles = await loadProfiles(activeId);
          const completed = freshProfiles.filter((p) => p.status === "completed");
          if (completed.length === 0) return;

          const summaryLines = completed.map((p) => {
            const pd = p.profile_data;
            const scores = p.category_scores;
            return `- ${p.url} (Score: ${p.overall_score}/100)${p.is_own_website ? " [OWN WEBSITE]" : ""}\n  Strengths: ${pd?.strengths?.join(", ") || "N/A"}\n  Weaknesses: ${pd?.weaknesses?.join(", ") || "N/A"}\n  Categories: Findability ${scores?.findability ?? "?"}, Mobile ${scores?.mobileUsability ?? "?"}, Offer ${scores?.offerClarity ?? "?"}, Trust ${scores?.trustProof ?? "?"}, Conversion ${scores?.conversionReadiness ?? "?"}`;
          });

          const summaryPrompt = `Analysis data:\n\n${summaryLines.join("\n\n")}\n\nBased on these results, give a brief actionable overview. Focus on the most important finding and the top 3 action items. Do NOT repeat all scores or list all data — be conversational and direct. Do NOT introduce yourself or say "I've reviewed the data".`;

          const chatHistory = [{ role: "user", content: summaryPrompt }];

          let assistantContent = "";
          const tempId = `temp-summary-${Date.now()}`;
          setMessages((prev) => [
            ...prev,
            { id: tempId, conversation_id: activeId, role: "assistant" as const, content: "", created_at: new Date().toISOString() },
          ]);
          setIsStreaming(true);

          await streamChat({
            messages: chatHistory,
            conversationId: activeId,
            accessToken: token,
            model,
            onDelta: (delta) => {
              assistantContent += delta;
              setMessages((prev) =>
                prev.map((m) => (m.id === tempId ? { ...m, content: assistantContent } : m))
              );
            },
            onDone: () => {},
          });

          const savedAssistant = await saveMessage(activeId, "assistant", assistantContent);
          setMessages((prev) => prev.map((m) => (m.id === tempId ? savedAssistant : m)));
          setIsStreaming(false);
        } catch (e) {
          console.error("Summary generation failed:", e);
          setIsStreaming(false);
        }
      }, 3000);
    } catch (e) {
      toast.error("Analysis request failed");
      console.error(e);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // ─── Sidebar data mapping ───
  const sidebarConversations = conversations.map((c) => ({
    id: c.id,
    title: c.title,
    messages: [] as { id: string; role: "user" | "assistant"; content: string; createdAt: string }[],
    createdAt: c.created_at,
  }));

  const activeConversation = conversations.find((c) => c.id === activeId) || null;
  const completedProfiles = profiles.filter((p) => p.status === "completed");
  const hasProfiles = completedProfiles.length > 0;
  const hasMultipleProfiles = completedProfiles.length >= 2;

  if (authLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="h-screen flex flex-col bg-background">
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

  const chatHeader = (
    <div className="border-b border-border bg-card px-4 py-3 flex items-center gap-3">
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden shrink-0"
        onClick={() => setSidebarOpen(true)}
      >
        {sidebarOpen ? <PanelLeftClose className="w-5 h-5" /> : <PanelLeftOpen className="w-5 h-5" />}
      </Button>
      {isMobile && (
        <Button
          variant="ghost"
          size="icon"
          className="shrink-0 ml-auto"
          onClick={() => setMobileView(mobileView === "chat" ? "dashboard" : "chat")}
        >
          {mobileView === "chat" ? (
            <LayoutDashboard className="w-5 h-5" />
          ) : (
            <MessageSquare className="w-5 h-5" />
          )}
        </Button>
      )}
      <div className="min-w-0">
        <h2 className="text-sm font-medium text-foreground truncate">
          {activeConversation?.title || "Select a conversation"}
        </h2>
        {activeConversation && (
          <p className="text-xs text-muted-foreground">
            {messages.length} messages
            {isAnalyzing && " · Analyzing..."}
          </p>
        )}
      </div>
    </div>
  );

  const chatPanel = (
    <div className="flex-1 flex flex-col min-w-0 h-full">
      {chatHeader}
      <ScrollArea className="flex-1">
        <div className="max-w-3xl mx-auto p-4 space-y-4">
          {messages.length === 0 && activeId && (
            <div className="flex items-center justify-center h-64 text-muted-foreground text-sm">
              Enter a URL or ask a question...
            </div>
          )}
          {messages.map((msg) => (
            <ChatMessage key={msg.id} message={msg} />
          ))}
          <div ref={scrollRef} />
        </div>
      </ScrollArea>
      {profiles.some((p) => p.status !== "completed" && p.status !== "error") && (
        <AnalysisProgress profiles={profiles} />
      )}
      <div className="max-w-3xl mx-auto w-full">
        <ChatInput
          onSend={handleSend}
          onScan={handleScan}
          disabled={!activeId || isStreaming}
          hasProfiles={profiles.length > 0}
          initialOwnUrl={profiles.find((p) => p.is_own_website)?.url}
          initialCompetitorUrls={profiles.filter((p) => !p.is_own_website).map((p) => p.url)}
        />
      </div>
    </div>
  );

  // ─── Pending/analyzing profiles for status display ───
  const pendingProfiles = profiles.filter((p) => p.status !== "completed" && p.status !== "error");

  const dashboardPanel = (
    <div className="h-full flex flex-col">
      <div className="border-b border-border bg-card px-4 py-3">
        <h2 className="text-sm font-medium text-foreground">Workspace</h2>
      </div>
      {hasProfiles && (
        <div className="border-b border-border bg-card px-4 py-1">
          <Tabs value={analysisTab} onValueChange={setAnalysisTab}>
            <TabsList className="bg-transparent h-8 p-0 gap-0">
              <TabsTrigger value="overview" className="text-[11px] h-7 px-3 data-[state=active]:bg-secondary rounded-md">Overview</TabsTrigger>
              <TabsTrigger value="positioning" className="text-[11px] h-7 px-3 data-[state=active]:bg-secondary rounded-md">Positioning</TabsTrigger>
              <TabsTrigger value="offers" className="text-[11px] h-7 px-3 data-[state=active]:bg-secondary rounded-md">Offer & CTAs</TabsTrigger>
              <TabsTrigger value="trust" className="text-[11px] h-7 px-3 data-[state=active]:bg-secondary rounded-md">Trust & Proof</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      )}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          {/* Show pending/analyzing profiles */}
          {pendingProfiles.length > 0 && (
            <div className="space-y-2">
              {pendingProfiles.map((p) => (
                <div key={p.id} className="flex items-center gap-3 p-3 rounded-lg border border-border bg-card">
                  <Loader2 className="w-4 h-4 animate-spin text-primary shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{p.url}</p>
                    <p className="text-[11px] text-muted-foreground capitalize">{p.status === "crawling" ? "Crawling website..." : p.status === "analyzing" ? "AI analyzing..." : p.status}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Error profiles */}
          {profiles.filter((p) => p.status === "error").map((p) => (
            <div key={p.id} className="flex items-center gap-3 p-3 rounded-lg border border-destructive/30 bg-destructive/5">
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{p.url}</p>
                <p className="text-[11px] text-destructive">{p.error_message || "Analysis failed"}</p>
              </div>
            </div>
          ))}

          {analysisTab === "overview" ? (
            <>
              {hasProfiles && <WebsiteGrid profiles={completedProfiles} />}
              {hasMultipleProfiles && (
                <div>
                  <h3 className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-2">Comparison</h3>
                  <ComparisonTable profiles={completedProfiles} />
                </div>
              )}
              {hasProfiles && tasks.length > 0 && (
                <div>
                  <h3 className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-2">Improvement Plan</h3>
                  <ImprovementPlan tasks={tasks} />
                </div>
              )}
            </>
          ) : (
            hasMultipleProfiles && <AnalysisTabsContent tab={analysisTab} profiles={completedProfiles} />
          )}

          {!hasProfiles && pendingProfiles.length === 0 && profiles.filter((p) => p.status === "error").length === 0 && (
            <div className="flex items-center justify-center h-40 text-muted-foreground text-sm">
              Start an analysis to see results here
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );

  return (
    <div className="h-screen flex flex-col bg-background">
      <Navbar />
      <div className="flex-1 flex overflow-hidden">
        {/* Desktop Sidebar */}
        <div className="hidden md:block w-72 shrink-0">
          <ChatSidebar
            conversations={sidebarConversations}
            activeId={activeId}
            onSelect={(id) => setActiveId(id)}
            onNew={handleNewConversation}
            onDelete={handleOpenDeleteDialog}
          />
        </div>

        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-50 md:hidden">
            <div
              className="absolute inset-0 bg-background/80 backdrop-blur-sm"
              onClick={() => setSidebarOpen(false)}
            />
            <div className="relative w-72 h-full">
              <ChatSidebar
                conversations={sidebarConversations}
                activeId={activeId}
                onSelect={(id) => {
                  setActiveId(id);
                  setSidebarOpen(false);
                }}
                onNew={handleNewConversation}
                onDelete={handleOpenDeleteDialog}
              />
            </div>
          </div>
        )}

        {/* Main Content */}
        {isMobile ? (
          <div className="flex-1 flex flex-col min-w-0">
            {mobileView === "chat" ? chatPanel : dashboardPanel}
          </div>
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

      <AlertDialog open={deleteDialogState.isOpen} onOpenChange={(open) => !open && setDeleteDialogState({ isOpen: false, conversationId: null })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete conversation?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The conversation and all associated data will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Chat;
