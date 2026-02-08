export interface BusinessGenome {
  id: string;
  domain: string;
  companyName: string;
  marketSegment: string;
  businessModel: string;
  businessModelDescription: string;
  offers: Array<{
    name: string;
    type: string;
    priceSignal: string;
  }>;
  audienceClusters: Array<{
    name: string;
    description: string;
  }>;
  messagingPatterns: Array<{
    usp: string;
    tone: string;
  }>;
  funnelType: string;
  funnelElements: string[];
  channels: string[];
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
    businessModelDescription:
      "Stripe provides payment processing infrastructure as a service. Revenue is generated through transaction fees (2.9% + 30¢ per successful charge) and subscription-based products for advanced features like Billing, Connect, and Atlas.",
    offers: [
      { name: "Payments", type: "API Service", priceSignal: "2.9% + 30¢ per transaction" },
      { name: "Billing", type: "Subscription Management", priceSignal: "0.5% of recurring revenue" },
      { name: "Connect", type: "Marketplace Payments", priceSignal: "Custom pricing" },
      { name: "Atlas", type: "Company Incorporation", priceSignal: "$500 one-time" },
      { name: "Radar", type: "Fraud Prevention", priceSignal: "$0.05 per screened transaction" },
    ],
    audienceClusters: [
      {
        name: "Tech Startups & SaaS",
        description: "Early-stage to growth-stage software companies needing flexible payment integration with developer-first APIs.",
      },
      {
        name: "Enterprise Platforms",
        description: "Large marketplaces and platforms requiring multi-party payment flows, payouts, and compliance tooling.",
      },
      {
        name: "E-Commerce Businesses",
        description: "Online retailers looking for checkout optimization, subscription billing, and international payment support.",
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
    createdAt: "2025-02-05T14:30:00Z",
    status: "completed",
  },
  {
    id: "demo-notion",
    domain: "notion.so",
    companyName: "Notion",
    marketSegment: "Productivity / Collaboration",
    businessModel: "Freemium SaaS",
    businessModelDescription:
      "Notion offers a free personal plan with limited features. Revenue comes from team and business subscriptions with per-user pricing. The product combines notes, docs, wikis, and project management.",
    offers: [
      { name: "Free Plan", type: "Personal Use", priceSignal: "$0/mo" },
      { name: "Plus", type: "Small Teams", priceSignal: "$10/user/mo" },
      { name: "Business", type: "Mid-Market", priceSignal: "$18/user/mo" },
      { name: "Enterprise", type: "Large Orgs", priceSignal: "Custom" },
    ],
    audienceClusters: [
      {
        name: "Individual Knowledge Workers",
        description: "Freelancers, students, and professionals using Notion for personal note-taking, journaling, and task management.",
      },
      {
        name: "Startup Teams",
        description: "Small to mid-sized teams replacing multiple tools (Google Docs, Trello, Confluence) with a single workspace.",
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
    createdAt: "2025-02-04T09:15:00Z",
    status: "completed",
  },
  {
    id: "demo-linear",
    domain: "linear.app",
    companyName: "Linear",
    marketSegment: "Developer Tools / Project Management",
    businessModel: "Freemium SaaS",
    businessModelDescription:
      "Linear offers a free tier for small teams and charges per-user for larger teams. Focus on speed and developer experience for issue tracking and project management.",
    offers: [
      { name: "Free", type: "Small Teams", priceSignal: "$0 up to 250 issues" },
      { name: "Standard", type: "Growing Teams", priceSignal: "$8/user/mo" },
      { name: "Plus", type: "Scaling", priceSignal: "$14/user/mo" },
    ],
    audienceClusters: [
      {
        name: "Engineering Teams",
        description: "Software development teams frustrated with slow, bloated project management tools like Jira.",
      },
      {
        name: "Product Teams",
        description: "Product managers seeking a fast, keyboard-driven tool for roadmapping and sprint planning.",
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
    contentFormats: ["Blog", "Changelog", "Product Updates", "Twitter Threads"],
    trustElements: [
      "Used by Vercel, Coinbase, Cash App",
      "Y Combinator backed",
      "4.9★ rating on G2",
    ],
    trafficData: null,
    createdAt: "2025-02-03T16:45:00Z",
    status: "completed",
  },
];

export const demoScans = demoGenomes.map((g) => ({
  id: g.id,
  domain: g.domain,
  companyName: g.companyName,
  marketSegment: g.marketSegment,
  status: g.status,
  createdAt: g.createdAt,
}));
