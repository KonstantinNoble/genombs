import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit2, Trash2 } from "lucide-react";
import { Idea } from "./IdeaWorkspace";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface IdeaCardProps {
  idea: Idea;
  onEdit: () => void;
  onDelete: () => void;
  onStatusChange: (status: Idea["status"]) => void;
}

const IdeaCard = ({ idea, onEdit, onDelete, onStatusChange }: IdeaCardProps) => {
  const priorityColors = {
    low: "bg-blue-500/20 text-blue-500",
    medium: "bg-yellow-500/20 text-yellow-500",
    high: "bg-red-500/20 text-red-500",
  };

  return (
    <Card className="group hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <h4 className="font-semibold cursor-pointer hover:text-primary transition-colors line-clamp-2">
                {idea.title}
              </h4>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => onStatusChange("idea")}>
                Move to Idea
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onStatusChange("planning")}>
                Move to Planning
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onStatusChange("in-progress")}>
                Move to In Progress
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onStatusChange("completed")}>
                Move to Completed
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onEdit}>
              <Edit2 className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-destructive"
              onClick={onDelete}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground line-clamp-3">{idea.description}</p>
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className={priorityColors[idea.priority]}>
            {idea.priority}
          </Badge>
          <Badge variant="outline">{idea.category}</Badge>
        </div>
        {idea.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {idea.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default IdeaCard;
