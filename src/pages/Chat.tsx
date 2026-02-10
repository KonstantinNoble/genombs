import { useState } from "react";
import { PanelLeftOpen, PanelLeftClose, LayoutDashboard, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import Navbar from "@/components/Navbar";
import ChatSidebar from "@/components/chat/ChatSidebar";
import ChatMessage from "@/components/chat/ChatMessage";
import ChatInput from "@/components/chat/ChatInput";
import WebsiteGrid from "@/components/dashboard/WebsiteGrid";
import ComparisonTable from "@/components/dashboard/ComparisonTable";
import TaskBoard from "@/components/dashboard/TaskBoard";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  mockConversations,
  mockWebsiteProfiles,
  mockTasks,
  type ChatConversation,
  type ChatMessage as ChatMessageType,
} from "@/lib/mock-chat-data";

const Chat = () => {
  const isMobile = useIsMobile();
  const [conversations, setConversations] = useState<ChatConversation[]>(mockConversations);
  const [activeId, setActiveId] = useState<string | null>(mockConversations[0]?.id || null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mobileView, setMobileView] = useState<"chat" | "dashboard">("chat");

  const activeConversation = conversations.find((c) => c.id === activeId) || null;

  const handleNewConversation = () => {
    const newConv: ChatConversation = {
      id: `conv-${Date.now()}`,
      title: "Neue Conversation",
      messages: [],
      createdAt: new Date().toISOString(),
    };
    setConversations((prev) => [newConv, ...prev]);
    setActiveId(newConv.id);
    setSidebarOpen(false);
  };

  const handleSend = (content: string) => {
    if (!activeId) return;

    const userMsg: ChatMessageType = {
      id: `msg-${Date.now()}`,
      role: "user",
      content,
      createdAt: new Date().toISOString(),
    };

    const assistantMsg: ChatMessageType = {
      id: `msg-${Date.now() + 1}`,
      role: "assistant",
      content:
        "Das ist eine Demo-Antwort. Im finalen Produkt wird hier die KI-Analyse basierend auf den gecrawlten Website-Profilen angezeigt.",
      createdAt: new Date().toISOString(),
    };

    setConversations((prev) =>
      prev.map((c) =>
        c.id === activeId ? { ...c, messages: [...c.messages, userMsg, assistantMsg] } : c
      )
    );
  };

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
          {activeConversation?.title || "Wähle eine Conversation"}
        </h2>
        {activeConversation && (
          <p className="text-xs text-muted-foreground">
            {activeConversation.messages.length} Nachrichten
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
          {activeConversation?.messages.length === 0 && (
            <div className="flex items-center justify-center h-64 text-muted-foreground text-sm">
              Gib eine URL ein oder stelle eine Frage...
            </div>
          )}
          {activeConversation?.messages.map((msg) => (
            <ChatMessage key={msg.id} message={msg} />
          ))}
        </div>
      </ScrollArea>
      <div className="max-w-3xl mx-auto w-full">
        <ChatInput onSend={handleSend} disabled={!activeId} />
      </div>
    </div>
  );

  const dashboardPanel = (
    <div className="h-full flex flex-col">
      <div className="border-b border-border bg-card px-4 py-3">
        <h2 className="text-sm font-medium text-foreground">Dashboard</h2>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-4">
          <Tabs defaultValue="websites">
            <TabsList className="mb-4">
              <TabsTrigger value="websites">Websites</TabsTrigger>
              <TabsTrigger value="comparison">Vergleich</TabsTrigger>
              <TabsTrigger value="tasks">Aufgaben</TabsTrigger>
            </TabsList>
            <TabsContent value="websites">
              <WebsiteGrid profiles={mockWebsiteProfiles} />
            </TabsContent>
            <TabsContent value="comparison">
              <ComparisonTable profiles={mockWebsiteProfiles} />
            </TabsContent>
            <TabsContent value="tasks">
              <TaskBoard initialTasks={mockTasks} />
            </TabsContent>
          </Tabs>
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
            conversations={conversations}
            activeId={activeId}
            onSelect={(id) => setActiveId(id)}
            onNew={handleNewConversation}
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
                conversations={conversations}
                activeId={activeId}
                onSelect={(id) => {
                  setActiveId(id);
                  setSidebarOpen(false);
                }}
                onNew={handleNewConversation}
              />
            </div>
          </div>
        )}

        {/* Main Content */}
        {isMobile ? (
          // Mobile: toggle between chat and dashboard
          <div className="flex-1 flex flex-col min-w-0">
            {mobileView === "chat" ? chatPanel : dashboardPanel}
          </div>
        ) : (
          // Desktop: resizable split panels
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
    </div>
  );
};

export default Chat;
