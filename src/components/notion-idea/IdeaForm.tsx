import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Idea } from "./IdeaWorkspace";

interface IdeaFormProps {
  idea?: Idea | null;
  onSubmit: (idea: Omit<Idea, "id" | "createdAt"> | Idea) => void;
  onCancel: () => void;
}

const IdeaForm = ({ idea, onSubmit, onCancel }: IdeaFormProps) => {
  const [title, setTitle] = useState(idea?.title || "");
  const [description, setDescription] = useState(idea?.description || "");
  const [category, setCategory] = useState(idea?.category || "business");
  const [priority, setPriority] = useState<"low" | "medium" | "high">(
    idea?.priority || "medium"
  );
  const [status, setStatus] = useState<Idea["status"]>(idea?.status || "idea");
  const [tags, setTags] = useState(idea?.tags.join(", ") || "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const ideaData = {
      title,
      description,
      category,
      priority,
      status,
      tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
    };

    if (idea) {
      onSubmit({ ...idea, ...ideaData });
    } else {
      onSubmit(ideaData);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{idea ? "Edit Idea" : "New Idea"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter idea title"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your idea"
              rows={4}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="e.g., Business, Tech"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select value={priority} onValueChange={(v: any) => setPriority(v)}>
                <SelectTrigger id="priority">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={status} onValueChange={(v: any) => setStatus(v)}>
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="idea">Idea</SelectItem>
                  <SelectItem value="planning">Planning</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tags">Tags (comma separated)</Label>
            <Input
              id="tags"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="e.g., marketing, automation, growth"
            />
          </div>

          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit">{idea ? "Update" : "Create"} Idea</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default IdeaForm;
