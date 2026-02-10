import WebsiteProfileCard from "@/components/chat/WebsiteProfileCard";
import type { WebsiteProfile } from "@/lib/mock-chat-data";

interface WebsiteGridProps {
  profiles: WebsiteProfile[];
}

const WebsiteGrid = ({ profiles }: WebsiteGridProps) => {
  const ownSites = profiles.filter((p) => p.isOwnWebsite);
  const competitors = profiles.filter((p) => !p.isOwnWebsite);

  return (
    <div className="space-y-6">
      {ownSites.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-3">Eigene Website</h3>
          <div className="grid grid-cols-1 gap-4">
            {ownSites.map((p) => (
              <WebsiteProfileCard key={p.id} profile={p} />
            ))}
          </div>
        </div>
      )}
      {competitors.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-3">Konkurrenz ({competitors.length})</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
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
