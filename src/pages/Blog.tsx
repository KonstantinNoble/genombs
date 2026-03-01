import { useEffect, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { SEOHead } from "@/components/seo/SEOHead";
import { BreadcrumbSchema } from "@/components/seo/StructuredData";
import { blogPosts } from "@/lib/blog-data";

const Blog = () => {
  const observerRef = useRef<IntersectionObserver | null>(null);

  const setupObserver = useCallback(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("revealed");
            observerRef.current?.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -50px 0px" },
    );

    document
      .querySelectorAll(".scroll-reveal, .stagger-reveal")
      .forEach((el) => observerRef.current?.observe(el));
  }, []);

  useEffect(() => {
    setupObserver();
    return () => observerRef.current?.disconnect();
  }, [setupObserver]);

  return (
    <div className="min-h-screen bg-background/60 flex flex-col">
      <SEOHead
        title="Blog – Website Performance, SEO & Conversion Insights"
        description="Practical articles on website analysis, SEO strategy, performance optimization, and conversion readiness. No fluff, no filler — just actionable insights."
        keywords="website analysis blog, SEO strategy, website performance, conversion optimization"
        canonical="/blog"
      />
      <BreadcrumbSchema
        items={[
          { name: "Home", url: "https://synvertas.com" },
          { name: "Blog", url: "https://synvertas.com/blog" },
        ]}
      />

      <Navbar />

      <main className="flex-1">
        {/* Hero */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 dot-grid">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-normal text-foreground leading-[1.08] mb-6 animate-fade-in">
              Blog
            </h1>
            <p
              className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto animate-fade-in-up"
              style={{ animationDelay: "0.15s", animationFillMode: "both" }}
            >
              Insights on website performance, SEO, and what actually moves the
              needle.
            </p>
          </div>
        </section>

        {/* Articles Grid */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 border-t border-border">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {blogPosts.map((post, i) => (
                <Link
                  key={post.slug}
                  to={`/blog/${post.slug}`}
                  className="group border border-border bg-card rounded-lg p-6 sm:p-8 hover:border-primary/30 transition-colors duration-200 flex flex-col stagger-reveal"
                  style={{ animationDelay: `${i * 0.1}s` }}
                >
                  <span className="text-xs font-mono uppercase tracking-wider text-primary mb-4">
                    {post.category}
                  </span>
                  <h2 className="text-xl font-medium text-foreground mb-3 group-hover:text-primary transition-colors duration-200">
                    {post.title}
                  </h2>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-6 flex-1">
                    {post.excerpt}
                  </p>
                  <div className="flex items-center gap-3 text-xs font-mono text-muted-foreground">
                    <time dateTime={post.publishedAt}>
                      {new Date(post.publishedAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </time>
                    <span className="w-1 h-1 rounded-full bg-border" />
                    <span>{post.readingTime}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Blog;
