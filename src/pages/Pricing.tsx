import { Link } from "react-router-dom";
import { ArrowLeft, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Helmet } from "react-helmet-async";

const Pricing = () => {
  return (
    <>
      <Helmet>
        <title>Pricing | Wealthconomy</title>
        <meta 
          name="description" 
          content="Simple, transparent pricing for Wealthconomy. Start with our free plan and get 2 AI-powered business analyses per day at no cost." 
        />
      </Helmet>
      
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        
        <main className="flex-grow container mx-auto px-4 py-12">
          <div className="mb-12 text-center">
            <Link to="/">
              <Button variant="ghost" className="mb-4">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
              </Button>
            </Link>
            
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">Simple, Transparent Pricing</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Start for free and get AI-powered insights for your business
            </p>
          </div>

          <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8">
            {/* Free Plan */}
            <Card className="border-2 border-primary shadow-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-4 py-1 text-sm font-semibold">
                Current Plan
              </div>
              <CardHeader className="pt-8">
                <CardTitle className="text-3xl">Free Plan</CardTitle>
                <CardDescription className="text-lg">Perfect for getting started</CardDescription>
                <div className="mt-4">
                  <span className="text-5xl font-bold text-foreground">€0</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <Check className="mr-2 h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-foreground/80">2 AI analyses per day</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="mr-2 h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-foreground/80">Website Tools Recommendations</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="mr-2 h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-foreground/80">Business Ideas Generation</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="mr-2 h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-foreground/80">AI-powered insights</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="mr-2 h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-foreground/80">Email support</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="mr-2 h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-foreground/80">Credits reset every 24 hours</span>
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                <Link to="/auth" className="w-full">
                  <Button className="w-full" size="lg">
                    Get Started Free
                  </Button>
                </Link>
              </CardFooter>
            </Card>

            {/* Premium Plan */}
            <Card className="border-2 border-primary/50 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-gradient-to-l from-primary to-primary/80 text-primary-foreground px-4 py-1 text-sm font-semibold">
                Most Popular
              </div>
              <CardHeader className="pt-8">
                <CardTitle className="text-3xl">Premium Plan</CardTitle>
                <CardDescription className="text-lg">Unlimited AI insights</CardDescription>
                <div className="mt-4">
                  <span className="text-5xl font-bold text-foreground">€9.99</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <Check className="mr-2 h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-foreground/80 font-semibold">Unlimited AI analyses ✨</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="mr-2 h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-foreground/80">Priority support</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="mr-2 h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-foreground/80">Advanced analytics</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="mr-2 h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-foreground/80">Custom recommendations</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="mr-2 h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-foreground/80">Export reports</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="mr-2 h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-foreground/80">All future features</span>
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg hover:shadow-xl transition-all" 
                  size="lg"
                  onClick={() => window.location.href = 'https://whop.com/checkout/plan_8No5bGObMXwvq?d2c=true'}
                >
                  Get Premium
                </Button>
              </CardFooter>
            </Card>
          </div>

          <div className="mt-16 text-center max-w-3xl mx-auto">
            <h2 className="text-2xl font-semibold mb-4 text-foreground">Frequently Asked Questions</h2>
            <div className="space-y-6 text-left">
              <div>
                <h3 className="font-semibold text-lg mb-2 text-foreground">Is the free plan really free?</h3>
                <p className="text-foreground/80">
                  Yes! No credit card required. You get 2 AI analyses per day, completely free. Credits reset every 24 hours.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2 text-foreground">When will the Premium plan be available?</h3>
                <p className="text-foreground/80">
                  We're working hard on bringing you premium features. Sign up for the free plan to be notified when premium launches.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2 text-foreground">Can I upgrade later?</h3>
                <p className="text-foreground/80">
                  Absolutely! Once the Premium plan is available, you'll be able to upgrade seamlessly from your account dashboard.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2 text-foreground">What payment methods do you accept?</h3>
                <p className="text-foreground/80">
                  When premium launches, we'll accept all major credit cards, PayPal, and other secure payment methods through our payment processor.
                </p>
              </div>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default Pricing;
