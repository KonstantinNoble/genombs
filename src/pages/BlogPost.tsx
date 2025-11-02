import { useParams, Navigate, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ShopifyAffiliateBanner from "@/components/ShopifyAffiliateBanner";
import { blogPosts } from "@/data/blogPosts";
import { Badge } from "@/components/ui/badge";
import { Clock, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import ReactMarkdown from "react-markdown";
import { WebPageSchema, BreadcrumbSchema } from "@/components/seo/StructuredData";

const BlogPost = () => {
  const { slug } = useParams();
  const post = blogPosts.find((p) => p.slug === slug);

  if (!post) {
    return <Navigate to="/404" replace />;
  }

  return (
    <>
      <Helmet>
        <title>{post.title} - Wealthconomy Blog</title>
        <meta name="description" content={post.excerpt} />
        <meta name="keywords" content={post.keywords.join(", ")} />
        <link rel="canonical" href={`https://wealthconomy.com/blog/${post.slug}`} />
        <meta property="og:title" content={post.title} />
        <meta property="og:description" content={post.excerpt} />
        <meta property="og:type" content="article" />
        <meta property="article:published_time" content={post.date} />
        <meta property="article:author" content={post.author} />
        <meta property="article:section" content={post.category} />
      </Helmet>

      <WebPageSchema
        name={post.title}
        description={post.excerpt}
        url={`https://wealthconomy.com/blog/${post.slug}`}
      />

      <BreadcrumbSchema
        items={[
          { name: "Home", url: "https://wealthconomy.com" },
          { name: "Blog", url: "https://wealthconomy.com/blog" },
          { name: post.title, url: `https://wealthconomy.com/blog/${post.slug}` },
        ]}
      />

      <div className="min-h-screen bg-background">
        <Navbar />

        <article className="container mx-auto px-4 py-16 md:py-24 max-w-4xl">
          <Link to="/blog">
            <Button variant="ghost" className="mb-8 group">
              <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
              Back to Blog
            </Button>
          </Link>

          <header className="mb-12">
            <Badge variant="secondary" className="mb-4">
              {post.category}
            </Badge>
            
            <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
              {post.title}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-6">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>{post.readTime}</span>
              </div>
              <span>By {post.author}</span>
            </div>

            <p className="text-lg text-muted-foreground">
              {post.excerpt}
            </p>
          </header>

          <div className="prose prose-slate dark:prose-invert max-w-none">
            <ReactMarkdown
              components={{
                h1: ({ children }) => (
                  <h2 className="text-3xl font-bold mt-12 mb-6 first:mt-0">{children}</h2>
                ),
                h2: ({ children }) => (
                  <h3 className="text-2xl font-semibold mt-10 mb-4">{children}</h3>
                ),
                h3: ({ children }) => (
                  <h4 className="text-xl font-semibold mt-8 mb-3">{children}</h4>
                ),
                p: ({ children }) => (
                  <p className="mb-6 leading-relaxed text-foreground/90">{children}</p>
                ),
                ul: ({ children }) => (
                  <ul className="list-disc pl-6 mb-6 space-y-2">{children}</ul>
                ),
                ol: ({ children }) => (
                  <ol className="list-decimal pl-6 mb-6 space-y-2">{children}</ol>
                ),
                li: ({ children }) => (
                  <li className="leading-relaxed">{children}</li>
                ),
                strong: ({ children }) => (
                  <strong className="font-semibold text-foreground">{children}</strong>
                ),
                blockquote: ({ children }) => (
                  <blockquote className="border-l-4 border-primary pl-4 italic my-6">
                    {children}
                  </blockquote>
                ),
              }}
            >
              {post.content}
            </ReactMarkdown>
          </div>

          <footer className="mt-16 pt-8 border-t border-border">
            <div className="flex flex-wrap gap-2">
              {post.keywords.map((keyword) => (
                <Badge key={keyword} variant="outline" className="text-xs">
                  {keyword}
                </Badge>
              ))}
            </div>
          </footer>
        </article>

        <div className="container mx-auto px-4 py-12 max-w-4xl">
          <ShopifyAffiliateBanner />
        </div>

        <Footer />
      </div>
    </>
  );
};

export default BlogPost;
