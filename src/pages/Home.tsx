import { useEffect } from "react";
import Navbar from "@/components/Navbar";
import Hero from "@/components/home/Hero";
import Features from "@/components/home/Features";
import CTA from "@/components/home/CTA";
import Footer from "@/components/Footer";
import ShopifyAffiliateBanner from "@/components/ShopifyAffiliateBanner";

const Home = () => {
  useEffect(() => {
    // Set page title and meta description
    document.title = "Wealthconomy - AI-Powered Business Intelligence & Tools";
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute(
        "content",
        "Transform your business with AI-powered insights. Get personalized tool recommendations, business analysis, and strategic guidance. Start free today - no credit card required."
      );
    }
  }, []);

  return (
    <div className="min-h-screen">
      <Navbar />
      <main>
        <Hero />
        <ShopifyAffiliateBanner />
        <Features />
        <CTA />
      </main>
      <Footer />
    </div>
  );
};

export default Home;
