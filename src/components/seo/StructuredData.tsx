import { Helmet } from "react-helmet-async";

interface OrganizationSchemaProps {
  name: string;
  url: string;
  logo: string;
  description: string;
}

export const OrganizationSchema = ({ name, url, logo, description }: OrganizationSchemaProps) => {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": name,
    "url": url,
    "logo": logo,
    "description": description,
    "sameAs": [
      "https://twitter.com/synoptas",
      "https://www.linkedin.com/company/synoptas"
    ]
  };

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(schema)}
      </script>
    </Helmet>
  );
};

interface WebPageSchemaProps {
  name: string;
  description: string;
  url: string;
}

export const WebPageSchema = ({ name, description, url }: WebPageSchemaProps) => {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": name,
    "description": description,
    "url": url,
    "publisher": {
      "@type": "Organization",
      "name": "Synoptas",
      "logo": {
        "@type": "ImageObject",
        "url": "https://synoptas.com/favicon.png"
      }
    }
  };

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(schema)}
      </script>
    </Helmet>
  );
};

interface FAQSchemaProps {
  faqs: Array<{
    question: string;
    answer: string;
  }>;
}

export const FAQSchema = ({ faqs }: FAQSchemaProps) => {
  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(schema)}
      </script>
    </Helmet>
  );
};

interface BreadcrumbSchemaProps {
  items: Array<{
    name: string;
    url: string;
  }>;
}

export const BreadcrumbSchema = ({ items }: BreadcrumbSchemaProps) => {
  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": item.url
    }))
  };

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(schema)}
      </script>
    </Helmet>
  );
};
