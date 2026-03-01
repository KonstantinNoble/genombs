import { useParams, Link, Navigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { SEOHead } from "@/components/seo/SEOHead";
import { BreadcrumbSchema } from "@/components/seo/StructuredData";
import { getBlogPostBySlug } from "@/lib/blog-data";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuth();
  const post = slug ? getBlogPostBySlug(slug) : undefined;

  if (!post) {
    return <Navigate to="/blog" replace />;
  }

  const isLoggedIn = !!user;

  return (
    <div className="min-h-screen bg-background/60 flex flex-col">
      <SEOHead
        title={`${post.title} – Synvertas Blog`}
        description={post.excerpt}
        keywords={`${post.category.toLowerCase()}, website analysis, ${post.title.toLowerCase().split(" ").slice(0, 3).join(" ")}`}
        canonical={`/blog/${post.slug}`}
      />
      <BreadcrumbSchema
        items={[
          { name: "Home", url: "https://synvertas.com" },
          { name: "Blog", url: "https://synvertas.com/blog" },
          { name: post.title, url: `https://synvertas.com/blog/${post.slug}` },
        ]}
      />

      <Navbar />

      <main className="flex-1">
        <article className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="max-w-3xl mx-auto">
            {/* Back link */}
            <Link
              to="/blog"
              className="text-sm font-mono text-muted-foreground hover:text-foreground transition-colors duration-200 mb-10 inline-block"
            >
              &larr; Back to Blog
            </Link>

            {/* Header */}
            <header className="mb-10">
              <span className="text-xs font-mono uppercase tracking-wider text-primary mb-4 block">
                {post.category}
              </span>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-normal text-foreground leading-[1.12] mb-6">
                {post.title}
              </h1>
              <div className="flex items-center gap-3 text-sm font-mono text-muted-foreground">
                <time dateTime={post.publishedAt}>
                  {new Date(post.publishedAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </time>
                <span className="w-1 h-1 rounded-full bg-border" />
                <span>{post.readingTime}</span>
              </div>
            </header>

            {/* Divider */}
            <div className="h-px bg-border mb-10" />

            {/* Content */}
            <div className="blog-prose">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {post.content}
              </ReactMarkdown>
            </div>

            {/* CTA */}
            <div className="border border-border rounded-lg p-8 sm:p-10 mt-16 text-center space-y-5">
              <h2 className="text-2xl sm:text-3xl font-medium text-foreground">
                Ready to analyze your website?
              </h2>
              <p className="text-muted-foreground">
                Get scored across findability, trust, mobile usability, and
                conversion readiness in under 60 seconds.
              </p>
              <div className="pt-1">
                <Button size="lg" className="px-10 h-13 btn-glow" asChild>
                  <Link to={isLoggedIn ? "/chat" : "/auth"}>
                    {isLoggedIn ? "Analyze Now" : "Get Started Free"}
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </article>
      </main>

      <Footer />
    </div>
  );
};

export default BlogPost;
