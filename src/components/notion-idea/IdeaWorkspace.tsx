import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Edit2 } from "lucide-react";
import IdeaCard from "./IdeaCard";
import IdeaForm from "./IdeaForm";

export interface Idea {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: "low" | "medium" | "high";
  status: "idea" | "planning" | "in-progress" | "completed";
  createdAt: string;
  tags: string[];
}

const IdeaWorkspace = () => {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingIdea, setEditingIdea] = useState<Idea | null>(null);

  useEffect(() => {
    const savedIdeas = localStorage.getItem("notion-ideas");
    if (savedIdeas) {
      setIdeas(JSON.parse(savedIdeas));
    }
  }, []);

  const saveIdeas = (newIdeas: Idea[]) => {
    localStorage.setItem("notion-ideas", JSON.stringify(newIdeas));
    setIdeas(newIdeas);
  };

  const handleAddIdea = (idea: Omit<Idea, "id" | "createdAt">) => {
    const newIdea: Idea = {
      ...idea,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    saveIdeas([...ideas, newIdea]);
    setIsFormOpen(false);
  };

  const handleUpdateIdea = (updatedIdea: Idea) => {
    saveIdeas(ideas.map((idea) => (idea.id === updatedIdea.id ? updatedIdea : idea)));
    setEditingIdea(null);
    setIsFormOpen(false);
  };

  const handleDeleteIdea = (id: string) => {
    saveIdeas(ideas.filter((idea) => idea.id !== id));
  };

  const groupedIdeas = {
    idea: ideas.filter((i) => i.status === "idea"),
    planning: ideas.filter((i) => i.status === "planning"),
    "in-progress": ideas.filter((i) => i.status === "in-progress"),
    completed: ideas.filter((i) => i.status === "completed"),
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Your Ideas ({ideas.length})</h2>
        <Button onClick={() => setIsFormOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          New Idea
        </Button>
      </div>

      {isFormOpen && (
        <IdeaForm
          idea={editingIdea}
          onSubmit={editingIdea ? handleUpdateIdea : handleAddIdea}
          onCancel={() => {
            setIsFormOpen(false);
            setEditingIdea(null);
          }}
        />
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {(["idea", "planning", "in-progress", "completed"] as const).map((status) => (
          <div key={status} className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold capitalize">
                {status === "in-progress" ? "In Progress" : status}
              </h3>
              <span className="text-sm text-muted-foreground">
                {groupedIdeas[status].length}
              </span>
            </div>
            <div className="space-y-3">
              {groupedIdeas[status].map((idea) => (
                <IdeaCard
                  key={idea.id}
                  idea={idea}
                  onEdit={() => {
                    setEditingIdea(idea);
                    setIsFormOpen(true);
                  }}
                  onDelete={() => handleDeleteIdea(idea.id)}
                  onStatusChange={(newStatus) => {
                    const updatedIdea = { ...idea, status: newStatus };
                    handleUpdateIdea(updatedIdea);
                  }}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {ideas.length === 0 && !isFormOpen && (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground mb-4">No ideas yet. Start by creating your first idea!</p>
          <Button onClick={() => setIsFormOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create First Idea
          </Button>
        </Card>
      )}
    </div>
  );
};

export default IdeaWorkspace;
