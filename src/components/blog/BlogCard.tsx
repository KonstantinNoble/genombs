import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BlogPost } from "@/data/blogPosts";

interface BlogCardProps {
  post: BlogPost;
}

export const BlogCard = ({ post }: BlogCardProps) => {
  return (
    <Link to={`/blog/${post.slug}`} className="group">
      <Card className="h-full border-border/50 bg-card hover:border-emerald-500/50 hover:shadow-lg hover:shadow-emerald-500/10 transition-all duration-300 overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 group-hover:h-2 transition-all duration-300" />
        <CardHeader className="space-y-4 pt-6">
          <div className="flex items-center justify-between">
            <Badge variant="secondary" className="w-fit bg-emerald-950/50 text-emerald-400 border-emerald-800/50">
              {post.category}
            </Badge>
            <span className="text-xs text-muted-foreground">{post.readTime}</span>
          </div>
          <h3 className="text-xl font-bold leading-tight text-foreground group-hover:text-emerald-400 transition-colors">
            {post.title}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
            {post.excerpt}
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-sm font-medium text-emerald-400 group-hover:gap-3 transition-all">
            Read article
            <span className="group-hover:translate-x-1 transition-transform">→</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};
