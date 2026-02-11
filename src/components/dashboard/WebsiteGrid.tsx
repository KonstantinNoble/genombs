import WebsiteProfileCard from "@/components/chat/WebsiteProfileCard";
import type { WebsiteProfile } from "@/types/chat";

interface WebsiteGridProps {
  profiles: WebsiteProfile[];
}

const WebsiteGrid = ({ profiles }: WebsiteGridProps) => {
  const ownSites = profiles.filter((p) => p.is_own_website);
  const competitors = profiles.filter((p) => !p.is_own_website);

  return (
    <div className="space-y-4">
      {ownSites.length > 0 && (
        <div>
          <h3 className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-2">Your Website</h3>
          <div className="grid grid-cols-1 gap-3">
            {ownSites.map((p) => (
              <WebsiteProfileCard key={p.id} profile={p} />
            ))}
          </div>
        </div>
      )}
      {competitors.length > 0 && (
        <div>
          <h3 className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-2">Competitors ({competitors.length})</h3>
          <div className="grid grid-cols-1 gap-3">
            {competitors.map((p) => (
              <WebsiteProfileCard key={p.id} profile={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default WebsiteGrid;
