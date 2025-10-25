import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock } from "lucide-react";
import { blogPosts } from "@/data/blogPosts";

const Blog = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <section className="py-16 bg-gradient-to-b from-[hsl(220,35%,96%)] to-background relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(220,70%,15%,0.03)_1px,transparent_1px),linear-gradient(to_bottom,hsl(220,70%,15%,0.03)_1px,transparent_1px)] bg-[size:64px_64px]" />
        <div className="container relative mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center space-y-4 animate-fade-in-up">
            <h1 className="text-5xl md:text-6xl font-bold">Investment Insights</h1>
            <p className="text-xl text-muted-foreground">
              Expert knowledge to help you make smarter investment decisions
            </p>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {blogPosts.map((post, index) => (
              <Link key={post.id} to={`/blog/${post.id}`}>
                <Card className="h-full hover:shadow-xl transition-all duration-500 hover:-translate-y-2 border-border hover:border-secondary/30 group animate-scale-in" style={{ animationDelay: `${index * 0.1}s`, animationFillMode: "backwards" }}>
                  <CardHeader>
                    <Badge className="w-fit mb-2 bg-secondary/10 text-secondary hover:bg-secondary/20 transition-colors duration-300">
                      {post.category}
                    </Badge>
                    <h2 className="text-2xl font-bold mb-3 group-hover:text-secondary transition-colors duration-300">
                      {post.title}
                    </h2>
                    <p className="text-muted-foreground">{post.excerpt}</p>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      {post.readTime}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Blog;
