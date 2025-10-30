import { useParams, Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, ArrowLeft, Calendar } from "lucide-react";
import { blogPosts } from "@/data/blogPosts";
import NotFound from "./NotFound";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Components } from "react-markdown";

const markdownComponents: Components = {
  h1: ({ children }) => (
    <h1 className="text-4xl md:text-5xl font-bold mt-16 mb-8 leading-tight text-foreground">
      {children}
    </h1>
  ),
  h2: ({ children }) => (
    <h2 className="text-3xl md:text-4xl font-bold mt-16 mb-6 text-primary border-b border-border pb-3">
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="text-2xl md:text-3xl font-semibold mt-12 mb-5 text-foreground">
      {children}
    </h3>
  ),
  h4: ({ children }) => (
    <h4 className="text-xl md:text-2xl font-semibold mt-8 mb-4 text-muted-foreground">
      {children}
    </h4>
  ),
  p: ({ children }) => (
    <p className="text-lg md:text-xl leading-relaxed mb-6 text-foreground">
      {children}
    </p>
  ),
  strong: ({ children }) => (
    <strong className="font-bold text-primary">
      {children}
    </strong>
  ),
  a: ({ href, children }) => (
    <a 
      href={href} 
      className="text-secondary font-semibold no-underline hover:underline decoration-2 underline-offset-2 transition-all duration-300"
    >
      {children}
    </a>
  ),
  ul: ({ children }) => (
    <ul className="list-disc pl-6 my-8 space-y-3">
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="list-decimal pl-6 my-8 space-y-3">
      {children}
    </ol>
  ),
  li: ({ children }) => (
    <li className="text-lg md:text-xl leading-relaxed text-foreground">
      {children}
    </li>
  ),
  blockquote: ({ children }) => (
    <blockquote className="border-l-4 border-secondary pl-6 my-8 bg-muted/30 py-4 rounded-r-lg italic">
      {children}
    </blockquote>
  ),
  code: ({ children }) => (
    <code className="bg-muted px-2 py-1 rounded text-sm font-mono text-secondary">
      {children}
    </code>
  ),
};

const BlogPost = () => {
  const { id } = useParams();
  const post = blogPosts.find(p => p.id === id);

  if (!post) {
    return <NotFound />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-muted/10 to-background">
      <Navbar />
      
      <article className="py-12">
        <div className="container mx-auto px-4 animate-fade-in-up">
          <div className="max-w-4xl mx-auto">
            {/* Back Button */}
            <Link to="/blog">
              <Button 
                variant="ghost" 
                className="mb-8 -ml-4 hover:translate-x-1 transition-transform duration-300 group hover:bg-muted"
              >
                <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform duration-300" />
                Back to Articles
              </Button>
            </Link>

            {/* Category Badge */}
            <Badge className="mb-6 bg-primary/5 text-primary hover:bg-primary/10 transition-colors duration-300 border border-primary/20 text-sm px-3 py-1">
              {post.category}
            </Badge>
            
            {/* Title */}
            <h1 className="text-4xl md:text-6xl font-bold mb-8 leading-tight text-foreground">
              {post.title}
            </h1>
            
            {/* Meta Information */}
            <div className="flex items-center gap-6 text-muted-foreground mb-12 pb-8 border-b border-border flex-wrap">
              <div className="flex items-center gap-2 bg-muted/50 px-4 py-2 rounded-full">
                <Clock className="h-4 w-4" />
                <span className="text-sm font-medium">{post.readTime}</span>
              </div>
              <div className="flex items-center gap-2 bg-muted/50 px-4 py-2 rounded-full">
                <Calendar className="h-4 w-4" />
                <time dateTime={post.date} className="text-sm font-medium">
                  {new Date(post.date).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </time>
              </div>
            </div>

            {/* Content */}
            <div className="prose prose-lg max-w-none">
              <ReactMarkdown 
                remarkPlugins={[remarkGfm]}
                components={markdownComponents}
              >
                {post.content}
              </ReactMarkdown>
            </div>

            {/* Bottom CTA */}
            <div className="mt-16 pt-10 border-t border-border">
              <Link to="/blog">
                <Button 
                  variant="outline" 
                  className="hover:scale-105 transition-all duration-300 group hover:border-secondary/50 hover:bg-secondary/5"
                >
                  <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform duration-300" />
                  View All Articles
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </article>

      <Footer />
    </div>
  );
};

export default BlogPost;
