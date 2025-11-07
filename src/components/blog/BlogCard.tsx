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
      <Card className="h-full border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 hover:border-emerald-500/50 hover:shadow-xl transition-all duration-300 overflow-hidden">
        <div className="h-2 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 group-hover:h-3 transition-all duration-300" />
        <CardHeader className="space-y-4 pt-6">
          <div className="flex items-center justify-between">
            <Badge variant="secondary" className="w-fit bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800">
              {post.category}
            </Badge>
            <span className="text-xs text-slate-500 dark:text-slate-500">{post.readTime}</span>
          </div>
          <h3 className="text-xl font-bold leading-tight text-slate-900 dark:text-slate-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
            {post.title}
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-3 leading-relaxed">
            {post.excerpt}
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-sm font-medium text-emerald-600 dark:text-emerald-400 group-hover:gap-3 transition-all">
            Read article
            <span className="group-hover:translate-x-1 transition-transform">→</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};
