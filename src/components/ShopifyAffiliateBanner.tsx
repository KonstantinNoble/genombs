import shopifyBanner from "@/assets/shopify-affiliate-banner.png";

const ShopifyAffiliateBanner = () => {
  return (
    <div className="w-full flex justify-center my-8 animate-fade-in">
      <a
        href="https://shopify.pxf.io/aOExeZ"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-block transition-transform duration-300 hover:scale-105 hover:shadow-glow rounded-lg overflow-hidden"
      >
        <img
          src={shopifyBanner}
          alt="Start your Shopify business - Turn your idea into your business"
          className="max-w-full h-auto"
        />
      </a>
    </div>
  );
};

export default ShopifyAffiliateBanner;
