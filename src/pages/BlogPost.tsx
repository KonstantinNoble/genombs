import { useParams, Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, ArrowLeft } from "lucide-react";
import { blogPosts } from "@/data/blogPosts";
import NotFound from "./NotFound";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const BlogPost = () => {
  const { id } = useParams();
  const post = blogPosts.find(p => p.id === id);

  if (!post) {
    return <NotFound />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-[hsl(220,35%,96%)] to-background">
      <Navbar />
      
      <article className="py-12">
        <div className="container mx-auto px-4 animate-fade-in-up">
          <div className="max-w-4xl mx-auto">
            <Link to="/blog">
              <Button variant="ghost" className="mb-8 -ml-4 hover:translate-x-1 transition-transform duration-300 group">
                <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform duration-300" />
                Back to Articles
              </Button>
            </Link>

            <Badge className="mb-6 bg-primary/5 text-primary hover:bg-primary/10 transition-colors duration-300 border border-primary/20 text-sm px-3 py-1">
              {post.category}
            </Badge>
            
            <h1 className="text-4xl md:text-6xl font-bold mb-8 leading-tight bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">{post.title}</h1>
            
            <div className="flex items-center gap-3 text-muted-foreground mb-12 pb-8 border-b border-border">
              <div className="flex items-center gap-2 bg-muted/50 px-4 py-2 rounded-full">
                <Clock className="h-4 w-4" />
                <span className="text-sm font-medium">{post.readTime}</span>
              </div>
            </div>

            <div className="prose prose-lg max-w-none 
              prose-headings:font-serif prose-headings:font-bold 
              prose-h1:text-4xl prose-h1:mb-8
              prose-h2:text-3xl prose-h2:mt-16 prose-h2:mb-6 prose-h2:text-primary 
              prose-h3:text-xl prose-h3:mt-10 prose-h3:mb-4 prose-h3:font-semibold
              prose-p:text-foreground prose-p:leading-relaxed prose-p:mb-6 prose-p:text-lg
              prose-strong:text-foreground prose-strong:font-semibold 
              prose-a:text-secondary prose-a:no-underline hover:prose-a:underline 
              prose-ul:my-8 prose-ul:space-y-3
              prose-li:my-3 prose-li:text-foreground prose-li:text-lg prose-li:leading-relaxed
              prose-blockquote:border-l-4 prose-blockquote:border-secondary prose-blockquote:pl-6 prose-blockquote:italic"
            >
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {post.content}
              </ReactMarkdown>
            </div>

            <div className="mt-16 pt-10 border-t border-border">
              <Link to="/blog">
                <Button variant="outline" className="hover:scale-105 transition-transform duration-300 group">
                  <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform duration-300" />
                  View All Articles
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </article>
    </div>
  );
};

export default BlogPost;
