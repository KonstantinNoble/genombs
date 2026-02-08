export interface MarketInsight {
  insightType: "pattern" | "gap" | "barrier" | "signal";
  category: "Market" | "Channel" | "Content" | "Positioning";
  description: string;
  implication: string;
  premiumOnly?: boolean;
}

// Keep old type alias for backward compatibility during transition
export type Recommendation = MarketInsight;

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
  keyTakeaways: string[];
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
  recommendations: MarketInsight[];
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
      "Stripe dominates the API-first payment infrastructure segment. Key takeaway for market researchers: Their PLG motion and developer-first positioning create high barriers to entry. New entrants face a steep challenge — best-in-class documentation and a free sandbox drive adoption from startups to enterprises, making switching costs significant once integrated.",
    genomeScore: 92,
    keyTakeaways: [
      "This segment is dominated by PLG companies with developer-first positioning — documentation quality is the primary competitive moat.",
      "Transaction-based pricing with free sandbox access is the industry standard — subscription-only models are rare.",
      "SEO and developer documentation are the primary acquisition channels; social media plays a secondary role.",
      "All top players are expanding beyond payments into full financial infrastructure (lending, incorporation, treasury).",
    ],
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
        insightType: "pattern",
        category: "Market",
        description: "Developer documentation is the primary acquisition channel in the payment infrastructure segment. 4 out of 5 top players invest heavily in docs.",
        implication: "Any new entrant needs best-in-class developer docs to compete.",
      },
      {
        insightType: "gap",
        category: "Content",
        description: "Case studies and social proof content are surprisingly underutilized in this segment despite high enterprise deal values.",
        implication: "Content marketing focused on case studies could be a differentiation opportunity.",
      },
      {
        insightType: "barrier",
        category: "Positioning",
        description: "Transaction-based pricing with free sandbox access creates high switching costs once integrated.",
        implication: "Competing on price alone is insufficient — developer experience is the moat.",
      },
      {
        insightType: "signal",
        category: "Market",
        description: "All top players in this segment are expanding into financial services beyond payments (lending, incorporation, treasury).",
        implication: "The segment is expanding from pure payments to full financial infrastructure.",
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
      "Notion is a dominant player in the workspace consolidation trend, combining notes, docs, wikis, and project management. Key takeaway for market researchers: The template marketplace acts as a powerful organic growth channel. Viral adoption among individuals creates a bottom-up enterprise play that competitors struggle to replicate.",
    genomeScore: 87,
    keyTakeaways: [
      "Freemium with bottom-up adoption is the dominant go-to-market in this segment — individual users pull the product into teams.",
      "Template marketplaces and community-driven content are emerging as high-impact acquisition channels.",
      "Per-user subscription pricing is the revenue standard — usage-based pricing is rare in this segment.",
      "The consolidation trend (replacing multiple tools) is the core positioning for all top players.",
    ],
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
        insightType: "pattern",
        category: "Channel",
        description: "Template marketplaces are emerging as a high-impact discovery channel in the productivity segment. Community-created content drives organic reach.",
        implication: "Companies entering this segment should invest in ecosystem-driven content, not just owned channels.",
      },
      {
        insightType: "gap",
        category: "Content",
        description: "Comparison landing pages targeting direct competitors (Confluence, Coda, Asana) are underutilized despite high search intent.",
        implication: "Capturing competitive search traffic through comparison content is an untapped opportunity.",
        premiumOnly: true,
      },
      {
        insightType: "signal",
        category: "Market",
        description: "Bottom-up adoption (individual → team → enterprise) is the dominant growth pattern. All leading players rely on viral, user-driven expansion.",
        implication: "Enterprise-only go-to-market strategies face a significant disadvantage in this segment.",
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
      "Linear has carved out a strong niche in the developer tools segment by positioning against legacy tools like Jira. Key takeaway for market researchers: Speed and developer experience are the primary differentiators, not feature breadth. Word-of-mouth in the dev community drives growth — a playbook that's hard to replicate without authentic product quality.",
    genomeScore: 81,
    keyTakeaways: [
      "In the dev-tools PM segment, speed and UX are stronger differentiators than feature completeness.",
      "Word-of-mouth and community presence (Hacker News, Twitter/X) drive growth more than paid acquisition.",
      "Freemium with issue-based limits is the standard pricing pattern — free trials are less common.",
      "Jira migration tools are a critical acquisition lever for all challengers in this segment.",
    ],
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
        insightType: "gap",
        category: "Content",
        description: "SEO-optimized comparison pages (Linear vs Jira, Linear vs Asana) are largely absent in this segment despite high search intent for migration queries.",
        implication: "Comparison content targeting frustrated Jira users is a high-value, low-competition opportunity.",
      },
      {
        insightType: "pattern",
        category: "Market",
        description: "72% of companies in this segment offer a free tier with usage limits rather than time-limited trials. The free-to-paid conversion depends on team growth.",
        implication: "Free trials are less effective here — usage-based freemium is the proven conversion model.",
      },
      {
        insightType: "signal",
        category: "Channel",
        description: "YouTube presence is minimal across the segment. Developer-focused tutorials and workflow videos are an emerging but underexploited channel.",
        implication: "Early investment in developer video content could establish channel dominance before competitors move in.",
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
