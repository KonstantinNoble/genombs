import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Calendar } from "lucide-react";
import { blogPosts } from "@/data/blogPosts";

const Blog = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden bg-gradient-to-b from-muted/30 via-background to-background">
        <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(to_right,hsl(var(--border))_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border))_1px,transparent_1px)] bg-[size:64px_64px] opacity-30" />
        
        <div className="container relative z-10 mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center space-y-6 animate-fade-in-up">
            <div className="inline-block px-4 py-1.5 bg-secondary/10 rounded-full mb-2 border border-secondary/20">
              <span className="text-sm font-semibold text-secondary">Business Insights</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-primary via-primary to-accent bg-clip-text text-transparent pb-2">
              Expert Knowledge Hub
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Actionable strategies and insights to help entrepreneurs build, grow, and scale successful businesses
            </p>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-secondary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      </section>

      {/* Blog Grid Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {blogPosts.map((post, index) => (
              <Link 
                key={post.id} 
                to={`/blog/${post.id}`} 
                className="group block h-full"
              >
                <Card className="h-full flex flex-col hover:shadow-[var(--shadow-hover)] transition-all duration-500 hover:-translate-y-2 border-border hover:border-secondary/30 overflow-hidden bg-card animate-scale-in cursor-pointer" 
                  style={{ 
                    animationDelay: `${index * 0.1}s`, 
                    animationFillMode: "backwards" 
                  }}
                >
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-secondary via-[hsl(38,100%,50%)] to-secondary/50 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
                  
                  <CardHeader className="space-y-4 pb-4 flex-grow">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <Badge className="bg-primary/5 text-primary hover:bg-primary/10 transition-colors duration-300 border border-primary/20">
                        {post.category}
                      </Badge>
                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>{post.readTime}</span>
                      </div>
                    </div>

                    <h2 className="text-xl font-bold leading-tight group-hover:text-secondary transition-colors duration-300 line-clamp-2">
                      {post.title}
                    </h2>
                    
                    <p className="text-muted-foreground leading-relaxed line-clamp-3 text-sm">
                      {post.excerpt}
                    </p>
                  </CardHeader>

                  <CardContent className="pt-0 pb-6">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Calendar className="h-3.5 w-3.5" />
                      <time dateTime={post.date}>
                        {new Date(post.date).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </time>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Blog;
