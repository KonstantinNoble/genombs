import { Helmet } from "react-helmet-async";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ShopifyAffiliateBanner from "@/components/ShopifyAffiliateBanner";
import { Lightbulb, Rocket, Target, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { WebPageSchema } from "@/components/seo/StructuredData";

const About = () => {

  return (
    <div className="min-h-screen flex flex-col">
      <Helmet>
        <title>About Us - Wealthconomy | Empowering Entrepreneurs & Business Growth</title>
        <meta 
          name="description" 
          content="Discover Wealthconomy's mission to help entrepreneurs find direction, start successful businesses, and achieve their dreams. AI-powered guidance for business success. It's never too late to begin." 
        />
        <meta name="keywords" content="entrepreneurship, business guidance, startup support, business direction, entrepreneur tools, business empowerment, AI business mentor" />
        <link rel="canonical" href="https://wealthconomy.com/about" />
      </Helmet>
      <WebPageSchema
        name="About Wealthconomy - Empowering Entrepreneurs"
        description="Discover Wealthconomy's mission to help entrepreneurs find direction, start successful businesses, and achieve their dreams with AI-powered guidance."
        url="https://wealthconomy.com/about"
      />
      <Navbar />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-12 sm:py-16 lg:py-24">
          {/* Shopify Affiliate Banner */}
          <div className="max-w-4xl mx-auto mb-12">
            <ShopifyAffiliateBanner />
          </div>

          {/* Hero Section */}
          <header className="max-w-4xl mx-auto text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-primary/10 to-primary/5 px-4 py-2 rounded-full mb-6">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold text-primary">Our Mission</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold font-serif mb-6 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Empowering Your Journey to Success
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed">
              We believe everyone deserves the opportunity to find their path, build meaningful businesses, and achieve their dreams.
            </p>
          </header>

          {/* Why We Exist */}
          <div className="max-w-4xl mx-auto mb-16">
            <Card className="shadow-elegant border-primary/20 bg-gradient-to-br from-card to-card hover:shadow-hover transition-all duration-300">
              <CardContent className="p-8 sm:p-12">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center shadow-sm">
                    <Target className="h-6 w-6 text-primary" />
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-bold font-serif text-foreground">
                    Why Wealthconomy Exists
                  </h2>
                </div>
                <div className="space-y-4 text-foreground leading-relaxed">
                  <p className="text-base sm:text-lg">
                    Wealthconomy was born from a simple yet powerful vision: <strong>to help people find direction in life</strong> and provide them with the tools and guidance they need to start successful businesses.
                  </p>
                  <p className="text-base sm:text-lg">
                    We understand that navigating the business world can feel overwhelming. That's why we've created an AI-powered platform that cuts through the noise, offering personalized recommendations and actionable insights tailored to your unique situation.
                  </p>
                  <p className="text-base sm:text-lg">
                    Our goal is to <strong>empower entrepreneurs, dreamers, and innovators</strong> to transform their ideas into thriving ventures. Whether you're just starting out or looking to scale, we're here to support every step of your journey.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Core Values */}
          <div className="max-w-5xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold font-serif text-center mb-12 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              What Drives Us
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="shadow-elegant border-primary/20 bg-gradient-to-br from-card to-card hover:shadow-hover hover:scale-105 transition-all duration-300">
                <CardContent className="p-6">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center shadow-sm mb-4 mx-auto">
                    <Lightbulb className="h-7 w-7 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold text-center mb-3 text-foreground">Guidance & Clarity</h3>
                  <p className="text-sm text-muted-foreground text-center leading-relaxed">
                    We provide clear, actionable direction to help you navigate complex business decisions with confidence.
                  </p>
                </CardContent>
              </Card>

              <Card className="shadow-elegant border-primary/20 bg-gradient-to-br from-card to-card hover:shadow-hover hover:scale-105 transition-all duration-300">
                <CardContent className="p-6">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center shadow-sm mb-4 mx-auto">
                    <Rocket className="h-7 w-7 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold text-center mb-3 text-foreground">Growth & Success</h3>
                  <p className="text-sm text-muted-foreground text-center leading-relaxed">
                    We're committed to helping you build businesses that not only survive but thrive in competitive markets.
                  </p>
                </CardContent>
              </Card>

              <Card className="shadow-elegant border-primary/20 bg-gradient-to-br from-card to-card hover:shadow-hover hover:scale-105 transition-all duration-300">
                <CardContent className="p-6">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center shadow-sm mb-4 mx-auto">
                    <Target className="h-7 w-7 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold text-center mb-3 text-foreground">Empowerment</h3>
                  <p className="text-sm text-muted-foreground text-center leading-relaxed">
                    We believe in empowering you with knowledge and tools to take control of your entrepreneurial future.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Motivational Section */}
          <div className="max-w-4xl mx-auto mb-16">
            <Card className="shadow-elegant border-primary/20 bg-gradient-to-br from-card to-card hover:shadow-hover transition-all duration-300">
              <CardContent className="p-8 sm:p-12 text-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center shadow-sm mb-6 mx-auto">
                  <Sparkles className="h-8 w-8 text-primary animate-pulse" />
                </div>
                <h2 className="text-3xl sm:text-4xl font-bold font-serif mb-6 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                  Take Control of Your Future Today
                </h2>
                <div className="space-y-4 text-base sm:text-lg text-foreground leading-relaxed">
                  <p className="font-semibold">
                    It's never too late to start your journey.
                  </p>
                  <p>
                    Whether you're 25 or 55, whether you have a clear vision or you're still exploring possibilities, <strong>the best time to begin is now</strong>.
                  </p>
                  <p>
                    Every successful entrepreneur started exactly where you are today—with an idea, a dream, and the courage to take the first step.
                  </p>
                  <p className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent mt-8">
                    Your future is in your hands. Let's build it together.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default About;
