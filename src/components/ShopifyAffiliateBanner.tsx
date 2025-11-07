import { Card } from "@/components/ui/card";
import shopifyBanner from "@/assets/shopify-affiliate-banner.png";

const ShopifyAffiliateBanner = () => {
  return (
    <Card className="overflow-hidden border-secondary/20 shadow-elegant hover:shadow-hover transition-all duration-300 group max-w-3xl mx-auto">
      <a
        href="https://shopify.pxf.io/aOExeZ"
        target="_blank"
        rel="noopener noreferrer sponsored"
        className="block"
      >
        <div className="relative">
          <img
            src={shopifyBanner}
            alt="Turn your idea into your business with Shopify - Start for free then pay $1/month for 3 months"
            className="w-full h-auto object-contain transition-transform duration-300 group-hover:scale-[1.02]"
          />
        </div>
      </a>
      
      <div className="px-4 py-2 bg-muted/30 text-xs text-muted-foreground text-center">
        Affiliate Disclosure: We may earn a commission if you start a Shopify trial
      </div>
    </Card>
  );
};

export default ShopifyAffiliateBanner;
