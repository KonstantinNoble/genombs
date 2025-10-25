import { useParams, Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, User, ArrowLeft } from "lucide-react";
import { blogPosts } from "@/data/blogPosts";
import NotFound from "./NotFound";

const BlogPost = () => {
  const { id } = useParams();
  const post = blogPosts.find(p => p.id === id);

  if (!post) {
    return <NotFound />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <article className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <Link to="/blog">
              <Button variant="ghost" className="mb-8 -ml-4">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Blog
              </Button>
            </Link>

            <Badge className="mb-4 bg-secondary/10 text-secondary hover:bg-secondary/20">
              {post.category}
            </Badge>
            
            <h1 className="text-4xl md:text-5xl font-bold mb-6">{post.title}</h1>
            
            <div className="flex flex-wrap gap-6 text-muted-foreground mb-8 pb-8 border-b">
              <div className="flex items-center gap-2">
                <User className="h-5 w-5" />
                {post.author}
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                {new Date(post.date).toLocaleDateString('en-US', { 
                  month: 'long', 
                  day: 'numeric', 
                  year: 'numeric' 
                })}
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                {post.readTime}
              </div>
            </div>

            <div 
              className="prose prose-lg max-w-none prose-headings:font-serif prose-headings:font-bold prose-h1:text-4xl prose-h2:text-3xl prose-h3:text-2xl prose-p:text-foreground prose-p:leading-relaxed prose-strong:text-foreground prose-a:text-secondary prose-a:no-underline hover:prose-a:underline"
              dangerouslySetInnerHTML={{ __html: post.content.split('\n').map(line => {
                if (line.startsWith('# ')) {
                  return `<h1>${line.substring(2)}</h1>`;
                } else if (line.startsWith('## ')) {
                  return `<h2>${line.substring(3)}</h2>`;
                } else if (line.startsWith('### ')) {
                  return `<h3>${line.substring(4)}</h3>`;
                } else if (line.trim() === '') {
                  return '<br/>';
                } else if (line.startsWith('- ')) {
                  return `<li>${line.substring(2)}</li>`;
                } else if (line.match(/^\d+\. /)) {
                  return `<li>${line.substring(line.indexOf(' ') + 1)}</li>`;
                } else if (line.startsWith('**') && line.endsWith('**')) {
                  return `<p><strong>${line.substring(2, line.length - 2)}</strong></p>`;
                }
                return `<p>${line}</p>`;
              }).join('') }}
            />

            <div className="mt-12 pt-8 border-t">
              <Link to="/blog">
                <Button variant="outline">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to All Articles
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
