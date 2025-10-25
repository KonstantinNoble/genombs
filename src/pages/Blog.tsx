import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock } from "lucide-react";
import { blogPosts } from "@/data/blogPosts";

const Blog = () => {
  return (
    <>
      <title>Investment Blog - Expert Insights | Wealthconomy</title>
      <meta name="description" content="Read expert investment insights, market analysis, and wealth-building strategies. Learn from professionals about stock investing, portfolio management, and financial planning." />
    
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <section className="py-16 bg-gradient-to-b from-[hsl(220,35%,96%)] to-background relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(220,70%,15%,0.03)_1px,transparent_1px),linear-gradient(to_bottom,hsl(220,70%,15%,0.03)_1px,transparent_1px)] bg-[size:64px_64px]" />
        <div className="container relative mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center space-y-6 animate-fade-in-up">
            <div className="inline-block px-4 py-1.5 bg-secondary/10 rounded-full mb-2">
              <span className="text-sm font-semibold text-secondary">Investment Insights</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent pb-2">Expert Knowledge</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Evidence-based strategies and insights to help you make smarter, more confident investment decisions
            </p>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-10 max-w-6xl mx-auto">
            {blogPosts.map((post, index) => (
              <Link key={post.id} to={`/blog/${post.id}`} className="group">
                <Card className="h-full hover:shadow-xl transition-all duration-500 hover:-translate-y-2 border-border hover:border-secondary/30 overflow-hidden animate-scale-in" style={{ animationDelay: `${index * 0.1}s`, animationFillMode: "backwards" }}>
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-secondary to-[hsl(38,100%,50%)] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
                  <CardHeader className="space-y-4 pb-4">
                    <div className="flex items-center justify-between">
                      <Badge className="bg-primary/5 text-primary hover:bg-primary/10 transition-colors duration-300 border border-primary/20">
                        {post.category}
                      </Badge>
                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>{post.readTime}</span>
                      </div>
                    </div>
                    <h2 className="text-2xl font-bold leading-tight group-hover:text-secondary transition-colors duration-300">
                      {post.title}
                    </h2>
                    <p className="text-muted-foreground leading-relaxed">{post.excerpt}</p>
                  </CardHeader>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>
      <Footer />
    </div>
    </>
  );
};

export default Blog;
