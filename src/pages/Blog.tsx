import { Helmet } from "react-helmet-async";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { BlogCard } from "@/components/blog/BlogCard";
import { blogPosts } from "@/data/blogPosts";
import { WebPageSchema } from "@/components/seo/StructuredData";

const Blog = () => {
  return (
    <>
      <Helmet>
        <title>Blog - Wealthconomy | AI Business & Finance Insights</title>
        <meta
          name="description"
          content="Discover expert insights on AI-powered entrepreneurship, financial planning, and business strategy. Learn how to leverage AI tools for business growth."
        />
        <meta
          name="keywords"
          content="AI business blog, entrepreneurship insights, financial planning, AI tools, business automation, startup advice"
        />
        <link rel="canonical" href="https://wealthconomy.com/blog" />
      </Helmet>

      <WebPageSchema
        name="Wealthconomy Blog"
        description="Expert insights on AI-powered entrepreneurship, financial planning, and business strategy"
        url="https://wealthconomy.com/blog"
      />

      <div className="min-h-screen bg-background">
        <Navbar />

        <main className="container mx-auto px-4 py-16 md:py-24">
          <header className="text-center mb-16 max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent">
              Educational content & Resources
            </h1>
            <p className="text-lg text-muted-foreground">
              Expert guidance on building successful businesses with AI-powered tools and strategies
            </p>
          </header>

          <section className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {blogPosts.map((post) => (
              <article key={post.slug}>
                <BlogCard post={post} />
              </article>
            ))}
          </section>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default Blog;
