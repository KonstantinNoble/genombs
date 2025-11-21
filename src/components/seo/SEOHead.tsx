import { Helmet } from "react-helmet-async";

interface SEOHeadProps {
  title: string;
  description: string;
  keywords?: string;
  canonical?: string;
  ogType?: string;
  ogImage?: string;
  noindex?: boolean;
}

export const SEOHead = ({
  title,
  description,
  keywords = "AI business tools, business intelligence, AI recommendations, advertising strategy, business analysis",
  canonical,
  ogType = "website",
  ogImage = "https://storage.googleapis.com/gpt-engineer-file-uploads/1V6ymqHAwYaZZhk3iJbk6DSvvY92/social-images/social-1762282229478-Bildschirmfoto_4-11-2025_195020_preview--wealthconomy.lovable.app.jpeg",
  noindex = false
}: SEOHeadProps) => {
  const siteUrl = "https://synoptas.com";
  const fullTitle = `${title} | Synoptas`;
  const canonicalUrl = canonical ? `${siteUrl}${canonical}` : siteUrl;

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="title" content={fullTitle} />
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      {noindex && <meta name="robots" content="noindex, nofollow" />}
      {!noindex && <meta name="robots" content="index, follow" />}
      <link rel="canonical" href={canonicalUrl} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:site_name" content="Synoptas" />
      <meta property="og:locale" content="en_US" />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={canonicalUrl} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
      <meta name="twitter:creator" content="@synoptas" />
    </Helmet>
  );
};
