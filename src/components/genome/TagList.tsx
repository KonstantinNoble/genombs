import { Badge } from "@/components/ui/badge";

interface TagListProps {
  tags: string[];
  variant?: "default" | "outline" | "secondary";
}

const TagList = ({ tags, variant = "secondary" }: TagListProps) => {
  return (
    <div className="flex flex-wrap gap-2">
      {tags.map((tag) => (
        <Badge key={tag} variant={variant} className="text-sm font-normal">
          {tag}
        </Badge>
      ))}
    </div>
  );
};

export default TagList;
