import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

interface SidebarConversation {
  id: string;
  title: string;
  createdAt: string;
}

interface ChatSidebarProps {
  conversations: SidebarConversation[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onNew: () => void;
  onDelete?: (id: string) => void;
}

const ChatSidebar = ({ conversations, activeId, onSelect, onNew, onDelete }: ChatSidebarProps) => {
  return (
    <div className="flex flex-col h-full bg-[hsl(0,0%,5%)] border-r border-border/60">
      {/* Sidebar header */}
      <div className="px-4 pt-5 pb-4 border-b border-border/40">
        <span className="text-xs font-semibold tracking-widest text-muted-foreground/50 uppercase select-none">
          History
        </span>
        <Button
          onClick={onNew}
          variant="outline"
          size="sm"
          className="w-full mt-3 h-9 text-sm border-border/50 bg-transparent hover:bg-secondary/60 hover:border-border text-muted-foreground hover:text-foreground transition-all"
        >
          + New Conversation
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="py-2">
          {conversations.length === 0 && (
            <p className="px-4 py-8 text-sm text-muted-foreground/40 text-center">
              No conversations yet
            </p>
          )}
          {conversations.map((conv) => {
            const isActive = activeId === conv.id;
            return (
              <div
                key={conv.id}
                className={`group relative w-full text-left cursor-pointer flex items-stretch transition-all duration-150 ${isActive ? "bg-secondary/50" : "hover:bg-secondary/20"
                  }`}
                onClick={() => onSelect(conv.id)}
              >
                {/* Active left accent stripe */}
                <div
                  className={`w-[3px] shrink-0 transition-all duration-150 ${isActive ? "bg-primary" : "bg-transparent group-hover:bg-border"
                    }`}
                />

                <div className="flex items-start justify-between gap-2 px-4 py-3 flex-1 min-w-0">
                  <div className="min-w-0 flex-1">
                    <p
                      className={`text-sm truncate leading-snug transition-colors ${isActive
                          ? "text-foreground font-medium"
                          : "text-muted-foreground group-hover:text-foreground"
                        }`}
                    >
                      {conv.title}
                    </p>
                    <p className="text-xs text-muted-foreground/50 mt-1">
                      {new Date(conv.createdAt).toLocaleDateString("de-DE", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "2-digit",
                      })}
                    </p>
                  </div>

                  {onDelete && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(conv.id);
                      }}
                      className="opacity-0 group-hover:opacity-60 hover:!opacity-100 transition-opacity text-muted-foreground hover:text-destructive shrink-0 text-lg leading-none px-0.5 font-light"
                      title="Delete conversation"
                      aria-label="Delete conversation"
                    >
                      ×
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
};

export default ChatSidebar;
