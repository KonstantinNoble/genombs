import { ExternalLink } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import shopifyBanner from "@/assets/shopify-affiliate-banner.png";

const ShopifyAffiliateBanner = () => {
  return (
    <Card className="overflow-hidden border-secondary/20 shadow-elegant hover:shadow-hover transition-all duration-300 group">
      <a
        href="https://www.shopify.com/free-trial?ref=lovable"
        target="_blank"
        rel="noopener noreferrer sponsored"
        className="block"
      >
        <div className="relative">
          <img
            src={shopifyBanner}
            alt="Start your online store with Shopify - Get a free trial"
            className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
          
          <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex-1">
                <h3 className="text-xl sm:text-2xl font-bold mb-2">
                  Start Selling Online Today
                </h3>
                <p className="text-sm sm:text-base text-white/90">
                  Launch your e-commerce store with Shopify's powerful platform
                </p>
              </div>
              
              <Button 
                size="lg"
                className="bg-white text-primary hover:bg-white/90 font-semibold gap-2 shrink-0 group-hover:scale-105 transition-transform duration-300"
                asChild
              >
                <span>
                  Try Free
                  <ExternalLink className="h-4 w-4" />
                </span>
              </Button>
            </div>
          </div>
        </div>
      </a>
      
      <div className="px-4 py-2 bg-muted/30 text-xs text-muted-foreground text-center">
        Affiliate Disclosure: We may earn a commission if you start a Shopify trial
      </div>
    </Card>
  );
};

export default ShopifyAffiliateBanner;
