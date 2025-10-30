import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock } from "lucide-react";
import { blogPosts } from "@/data/blogPosts";
import ShopifyAffiliateBanner from "@/components/ShopifyAffiliateBanner";

const Blog = () => {
  return (
    <>
      <title>Business & Entrepreneurship Blog - Expert Insights | Wealthconomy</title>
      <meta name="description" content="Read expert insights on entrepreneurship, business strategy, AI-powered tools, and startup growth. Learn from successful founders and discover innovative business solutions." />
    
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <section className="py-16 bg-gradient-to-b from-[hsl(220,35%,96%)] to-background relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(220,70%,15%,0.03)_1px,transparent_1px),linear-gradient(to_bottom,hsl(220,70%,15%,0.03)_1px,transparent_1px)] bg-[size:64px_64px]" />
        <div className="container relative mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center space-y-6 animate-fade-in-up">
            <div className="inline-block px-4 py-1.5 bg-secondary/10 rounded-full mb-2">
              <span className="text-sm font-semibold text-secondary">Business Insights</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent pb-2">Expert Knowledge</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Actionable strategies and insights to help entrepreneurs build, grow, and scale successful businesses using AI and modern tools
            </p>
          </div>
        </div>
      </section>

      <section className="py-20 relative">
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-secondary/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        </div>
        <div className="container mx-auto px-4">
          <ShopifyAffiliateBanner />
          <div className="grid md:grid-cols-2 gap-10 max-w-6xl mx-auto">
            {blogPosts.map((post, index) => (
              <Link key={post.id} to={`/blog/${post.id}`} className="group">
                <Card className="h-full hover:shadow-glow transition-all duration-500 hover:-translate-y-3 border-border hover:border-secondary/40 overflow-hidden animate-scale-in bg-gradient-to-br from-card to-card/80 backdrop-blur-sm" style={{ animationDelay: `${index * 0.1}s`, animationFillMode: "backwards" }}>
                  <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-secondary via-primary to-secondary transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left shadow-glow" />
                  <CardHeader className="space-y-5 pb-6 p-8">
                    <div className="flex items-center justify-between">
                      <Badge className="bg-gradient-to-r from-primary/10 to-primary/5 text-primary hover:from-primary/20 hover:to-primary/10 transition-all duration-300 border border-primary/30 px-4 py-1.5 font-semibold shadow-sm">
                        {post.category}
                      </Badge>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground bg-background/50 px-3 py-1.5 rounded-full">
                        <Clock className="h-4 w-4" />
                        <span className="font-medium">{post.readTime}</span>
                      </div>
                    </div>
                    <h2 className="text-2xl font-bold leading-tight group-hover:bg-gradient-to-r group-hover:from-secondary group-hover:to-primary group-hover:bg-clip-text group-hover:text-transparent transition-all duration-300">
                      {post.title}
                    </h2>
                    <p className="text-muted-foreground leading-relaxed text-base">{post.excerpt}</p>
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
