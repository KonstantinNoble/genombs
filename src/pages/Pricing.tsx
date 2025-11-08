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
          content="Get unlimited AI-powered business analyses for $19.99/month. Premium access to advanced insights and recommendations." 
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
            
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">Unlock Unlimited AI Insights</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Premium access with unlimited analyses and advanced features
            </p>
          </div>

          <div className="max-w-2xl mx-auto">
            {/* Premium Plan - Only Option */}
            <Card className="border-2 border-primary shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-gradient-to-l from-primary to-primary/80 text-primary-foreground px-4 py-1 text-sm font-semibold">
                Premium Access
              </div>
              <CardHeader className="pt-8">
                <CardTitle className="text-3xl">Premium Plan</CardTitle>
                <CardDescription className="text-lg">Unlimited AI insights</CardDescription>
                <div className="mt-4">
                  <span className="text-5xl font-bold text-foreground">$19.99</span>
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
                  onClick={() => window.location.href = 'https://whop.com/checkout/plan_fIPIQB9r5qgPC?d2c=true'}
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
                <h3 className="font-semibold text-lg mb-2 text-foreground">How do I get access?</h3>
                <p className="text-foreground/80">
                  Click "Get Premium" to purchase via Whop. After payment, you'll receive a magic login link via email to access your account.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2 text-foreground">Can I cancel anytime?</h3>
                <p className="text-foreground/80">
                  Yes! You can cancel your subscription anytime. Your premium access will remain active until the end of your billing period.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2 text-foreground">What payment methods do you accept?</h3>
                <p className="text-foreground/80">
                  We accept all major credit cards and secure payment methods through Whop, our trusted payment processor.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2 text-foreground">What's included in unlimited analyses?</h3>
                <p className="text-foreground/80">
                  Get unlimited AI-powered website tool recommendations and business idea generation, with priority support and all future features included.
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
