export interface Recommendation {
  priority: "high" | "medium" | "low";
  category: "Content" | "Channel" | "Funnel" | "Positioning";
  description: string;
  premiumOnly?: boolean;
}

export interface Competitor {
  name: string;
  domain: string;
  similarity: number;
}

export interface ChannelStrength {
  channel: string;
  strength: "high" | "medium" | "low";
  priority: "primary" | "secondary";
}

export interface BusinessGenome {
  id: string;
  domain: string;
  companyName: string;
  marketSegment: string;
  businessModel: string;
  businessModelDescription: string;
  revenueModel: string;
  pricingTransparency: "low" | "medium" | "high";
  executiveSummary: string;
  genomeScore: number;
  offers: Array<{
    name: string;
    type: string;
    priceSignal: string;
    tier?: string;
  }>;
  audienceClusters: Array<{
    name: string;
    description: string;
    size: "small" | "medium" | "large";
    priority: "primary" | "secondary";
  }>;
  messagingPatterns: Array<{
    usp: string;
    tone: string;
  }>;
  funnelType: string;
  funnelElements: string[];
  channels: string[];
  channelStrengths: ChannelStrength[];
  contentFormats: string[];
  trustElements: string[];
  trafficData: {
    monthlyVisits: string;
    topKeywords: string[];
    trafficSources: Array<{
      source: string;
      percentage: number;
    }>;
  } | null;
  recommendations: Recommendation[];
  competitors: Competitor[];
  createdAt: string;
  status: "completed" | "analyzing" | "pending" | "failed";
}

export const demoGenomes: BusinessGenome[] = [
  {
    id: "demo-stripe",
    domain: "stripe.com",
    companyName: "Stripe",
    marketSegment: "Financial Infrastructure / Payments",
    businessModel: "SaaS / API-Platform",
    revenueModel: "Transaction-based",
    pricingTransparency: "high",
    executiveSummary:
      "Stripe is a dominant API-first payment infrastructure provider targeting developers and tech companies. Its product-led growth strategy, powered by best-in-class documentation and a free sandbox, drives adoption from startups to enterprises. Revenue is primarily transaction-based with expanding SaaS revenue streams.",
    genomeScore: 92,
    businessModelDescription:
      "Stripe provides payment processing infrastructure as a service. Revenue is generated through transaction fees (2.9% + 30¢ per successful charge) and subscription-based products for advanced features like Billing, Connect, and Atlas.",
    offers: [
      { name: "Payments", type: "API Service", priceSignal: "2.9% + 30¢ per transaction", tier: "Core" },
      { name: "Billing", type: "Subscription Management", priceSignal: "0.5% of recurring revenue", tier: "Growth" },
      { name: "Connect", type: "Marketplace Payments", priceSignal: "Custom pricing", tier: "Platform" },
      { name: "Atlas", type: "Company Incorporation", priceSignal: "$500 one-time", tier: "Addon" },
      { name: "Radar", type: "Fraud Prevention", priceSignal: "$0.05 per screened transaction", tier: "Addon" },
    ],
    audienceClusters: [
      {
        name: "Tech Startups & SaaS",
        description: "Early-stage to growth-stage software companies needing flexible payment integration with developer-first APIs.",
        size: "large",
        priority: "primary",
      },
      {
        name: "Enterprise Platforms",
        description: "Large marketplaces and platforms requiring multi-party payment flows, payouts, and compliance tooling.",
        size: "medium",
        priority: "primary",
      },
      {
        name: "E-Commerce Businesses",
        description: "Online retailers looking for checkout optimization, subscription billing, and international payment support.",
        size: "large",
        priority: "secondary",
      },
    ],
    messagingPatterns: [
      { usp: "Financial infrastructure for the internet", tone: "Authoritative, technical" },
      { usp: "Start in minutes, scale to billions", tone: "Aspirational" },
      { usp: "Developer-first payment APIs", tone: "Technical, pragmatic" },
    ],
    funnelType: "Product-Led Growth",
    funnelElements: [
      "Developer documentation as entry point",
      "Free sandbox / test mode",
      "Self-serve signup",
      "Usage-based pricing",
      "Enterprise sales for large accounts",
    ],
    channels: ["SEO", "Developer Docs", "Blog", "Twitter/X", "GitHub", "Conferences", "Partnerships"],
    channelStrengths: [
      { channel: "Developer Docs", strength: "high", priority: "primary" },
      { channel: "SEO", strength: "high", priority: "primary" },
      { channel: "Blog", strength: "medium", priority: "secondary" },
      { channel: "Twitter/X", strength: "medium", priority: "secondary" },
      { channel: "GitHub", strength: "high", priority: "primary" },
      { channel: "Conferences", strength: "medium", priority: "secondary" },
      { channel: "Partnerships", strength: "high", priority: "primary" },
    ],
    contentFormats: ["Technical Documentation", "Blog Articles", "Case Studies", "API Reference", "Video Tutorials"],
    trustElements: [
      "Used by millions of businesses",
      "PCI DSS Level 1 certified",
      "SOC 1 & SOC 2 compliant",
      "Customer logos: Amazon, Google, Shopify",
    ],
    trafficData: {
      monthlyVisits: "~45M",
      topKeywords: ["payment api", "online payments", "stripe", "payment processing", "accept payments online"],
      trafficSources: [
        { source: "Direct", percentage: 52 },
        { source: "Organic Search", percentage: 28 },
        { source: "Referral", percentage: 12 },
        { source: "Social", percentage: 5 },
        { source: "Paid", percentage: 3 },
      ],
    },
    recommendations: [
      {
        priority: "high",
        category: "Funnel",
        description: "Strong PLG motion — consider adding interactive product demos to reduce time-to-value for non-technical decision makers.",
      },
      {
        priority: "medium",
        category: "Content",
        description: "Case studies are underutilized. Publishing industry-specific success stories could accelerate enterprise adoption.",
      },
      {
        priority: "medium",
        category: "Channel",
        description: "Social media presence is relatively weak compared to organic. Investing in developer-focused video content on YouTube could expand reach.",
      },
      {
        priority: "low",
        category: "Positioning",
        description: "Consider creating a dedicated SMB landing page — current messaging is heavily developer/enterprise focused.",
        premiumOnly: true,
      },
    ],
    competitors: [
      { name: "PayPal / Braintree", domain: "paypal.com", similarity: 72 },
      { name: "Adyen", domain: "adyen.com", similarity: 68 },
      { name: "Square", domain: "squareup.com", similarity: 61 },
    ],
    createdAt: "2025-02-05T14:30:00Z",
    status: "completed",
  },
  {
    id: "demo-notion",
    domain: "notion.so",
    companyName: "Notion",
    marketSegment: "Productivity / Collaboration",
    businessModel: "Freemium SaaS",
    revenueModel: "Subscription",
    pricingTransparency: "high",
    executiveSummary:
      "Notion is a freemium productivity platform combining notes, docs, wikis, and project management. Its viral adoption among individuals and teams, combined with a large template ecosystem, drives organic growth. The product is a strong contender in the workspace consolidation trend.",
    genomeScore: 87,
    businessModelDescription:
      "Notion offers a free personal plan with limited features. Revenue comes from team and business subscriptions with per-user pricing. The product combines notes, docs, wikis, and project management.",
    offers: [
      { name: "Free Plan", type: "Personal Use", priceSignal: "$0/mo", tier: "Free" },
      { name: "Plus", type: "Small Teams", priceSignal: "$10/user/mo", tier: "Growth" },
      { name: "Business", type: "Mid-Market", priceSignal: "$18/user/mo", tier: "Business" },
      { name: "Enterprise", type: "Large Orgs", priceSignal: "Custom", tier: "Enterprise" },
    ],
    audienceClusters: [
      {
        name: "Individual Knowledge Workers",
        description: "Freelancers, students, and professionals using Notion for personal note-taking, journaling, and task management.",
        size: "large",
        priority: "primary",
      },
      {
        name: "Startup Teams",
        description: "Small to mid-sized teams replacing multiple tools (Google Docs, Trello, Confluence) with a single workspace.",
        size: "medium",
        priority: "primary",
      },
    ],
    messagingPatterns: [
      { usp: "One workspace for your whole team", tone: "Simple, inviting" },
      { usp: "Replace your scattered tools", tone: "Solution-oriented" },
    ],
    funnelType: "Freemium / Product-Led Growth",
    funnelElements: [
      "Free personal plan",
      "Template gallery as discovery",
      "Team invite flow",
      "Usage limits trigger upgrade",
    ],
    channels: ["SEO", "YouTube", "Twitter/X", "Community", "Template Marketplace", "Product Hunt"],
    channelStrengths: [
      { channel: "SEO", strength: "high", priority: "primary" },
      { channel: "YouTube", strength: "high", priority: "primary" },
      { channel: "Community", strength: "high", priority: "primary" },
      { channel: "Template Marketplace", strength: "medium", priority: "secondary" },
      { channel: "Twitter/X", strength: "medium", priority: "secondary" },
      { channel: "Product Hunt", strength: "low", priority: "secondary" },
    ],
    contentFormats: ["Templates", "Blog", "YouTube Videos", "Community Forums", "Webinars"],
    trustElements: [
      "Used by 30M+ users",
      "Customer logos: Figma, Pixar, Nike",
      "SOC 2 Type II certified",
    ],
    trafficData: {
      monthlyVisits: "~180M",
      topKeywords: ["notion", "project management", "note taking app", "team wiki", "notion templates"],
      trafficSources: [
        { source: "Direct", percentage: 65 },
        { source: "Organic Search", percentage: 20 },
        { source: "Referral", percentage: 8 },
        { source: "Social", percentage: 5 },
        { source: "Paid", percentage: 2 },
      ],
    },
    recommendations: [
      {
        priority: "high",
        category: "Channel",
        description: "Template marketplace is a powerful discovery channel. Investing in curated, high-quality templates for specific industries could accelerate growth.",
      },
      {
        priority: "medium",
        category: "Funnel",
        description: "Consider adding an onboarding wizard that pre-populates workspaces for specific use cases (project management, wiki, CRM).",
      },
      {
        priority: "low",
        category: "Content",
        description: "Create comparison landing pages targeting Confluence, Coda, and Asana to capture competitive search traffic.",
        premiumOnly: true,
      },
    ],
    competitors: [
      { name: "Confluence", domain: "atlassian.com", similarity: 65 },
      { name: "Coda", domain: "coda.io", similarity: 78 },
      { name: "Obsidian", domain: "obsidian.md", similarity: 52 },
    ],
    createdAt: "2025-02-04T09:15:00Z",
    status: "completed",
  },
  {
    id: "demo-linear",
    domain: "linear.app",
    companyName: "Linear",
    marketSegment: "Developer Tools / Project Management",
    businessModel: "Freemium SaaS",
    revenueModel: "Subscription",
    pricingTransparency: "high",
    executiveSummary:
      "Linear is a fast, keyboard-driven project management tool aimed at engineering and product teams frustrated with legacy tools like Jira. Its cult-like following in the developer community and word-of-mouth growth make it a strong challenger in the project management space.",
    genomeScore: 81,
    businessModelDescription:
      "Linear offers a free tier for small teams and charges per-user for larger teams. Focus on speed and developer experience for issue tracking and project management.",
    offers: [
      { name: "Free", type: "Small Teams", priceSignal: "$0 up to 250 issues", tier: "Free" },
      { name: "Standard", type: "Growing Teams", priceSignal: "$8/user/mo", tier: "Growth" },
      { name: "Plus", type: "Scaling", priceSignal: "$14/user/mo", tier: "Business" },
    ],
    audienceClusters: [
      {
        name: "Engineering Teams",
        description: "Software development teams frustrated with slow, bloated project management tools like Jira.",
        size: "medium",
        priority: "primary",
      },
      {
        name: "Product Teams",
        description: "Product managers seeking a fast, keyboard-driven tool for roadmapping and sprint planning.",
        size: "small",
        priority: "secondary",
      },
    ],
    messagingPatterns: [
      { usp: "Linear is a better way to build software", tone: "Bold, confident" },
      { usp: "Built for speed", tone: "Minimalist, performance-focused" },
    ],
    funnelType: "Product-Led Growth",
    funnelElements: [
      "Free team plan",
      "Jira import tool",
      "Word-of-mouth in dev community",
      "Self-serve upgrade",
    ],
    channels: ["Twitter/X", "Hacker News", "GitHub", "Blog", "Word of Mouth"],
    channelStrengths: [
      { channel: "Twitter/X", strength: "high", priority: "primary" },
      { channel: "Hacker News", strength: "high", priority: "primary" },
      { channel: "Word of Mouth", strength: "high", priority: "primary" },
      { channel: "Blog", strength: "medium", priority: "secondary" },
      { channel: "GitHub", strength: "medium", priority: "secondary" },
    ],
    contentFormats: ["Blog", "Changelog", "Product Updates", "Twitter Threads"],
    trustElements: [
      "Used by Vercel, Coinbase, Cash App",
      "Y Combinator backed",
      "4.9★ rating on G2",
    ],
    trafficData: null,
    recommendations: [
      {
        priority: "high",
        category: "Content",
        description: "Create SEO-optimized comparison pages (Linear vs Jira, Linear vs Asana) to capture high-intent search traffic.",
      },
      {
        priority: "medium",
        category: "Funnel",
        description: "Add a free trial to your funnel — 72% of competitors offer one beyond the issue-limited free plan.",
      },
      {
        priority: "medium",
        category: "Channel",
        description: "YouTube presence is minimal. Developer-focused tutorials and workflow videos could expand reach significantly.",
        premiumOnly: true,
      },
    ],
    competitors: [
      { name: "Jira", domain: "atlassian.com", similarity: 58 },
      { name: "Shortcut", domain: "shortcut.com", similarity: 82 },
      { name: "Height", domain: "height.app", similarity: 75 },
    ],
    createdAt: "2025-02-03T16:45:00Z",
    status: "completed",
  },
];

export const demoScans = demoGenomes.map((g) => ({
  id: g.id,
  domain: g.domain,
  companyName: g.companyName,
  marketSegment: g.marketSegment,
  businessModel: g.businessModel,
  genomeScore: g.genomeScore,
  sectionsCompleted: g.status === "completed" ? 9 : g.status === "analyzing" ? 5 : 0,
  totalSections: 9,
  status: g.status,
  createdAt: g.createdAt,
}));
