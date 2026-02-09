export interface ICPPersona {
  name: string;
  role: string;
  demographics: string;
  painPoints: string[];
  goals: string[];
  size: "small" | "medium" | "large";
  priority: "primary" | "secondary";
}

export interface AudienceChannel {
  platform: string;
  relevance: number;
  tip: string;
  category: "social" | "community" | "search" | "content" | "paid";
}

export interface Optimization {
  area: string;
  currentState: string;
  recommendation: string;
  priority: "high" | "medium" | "low";
  impact: "high" | "medium" | "low";
}

export interface OrganicStrategy {
  seo: { score: number; keywords: string[]; recommendation: string };
  content: { formats: string[]; topics: string[]; frequency: string };
  social: { platforms: string[]; contentTypes: string[]; cadence: string };
  community: { channels: string[]; approach: string };
}

export interface PaidChannel {
  channel: string;
  budgetLevel: "low" | "medium" | "high";
  format: string;
  targetingTip: string;
}

export interface PaidStrategy {
  recommendedChannels: PaidChannel[];
  competitionLevel: "low" | "medium" | "high";
  estimatedCPC: string;
}

export interface MarketSize {
  tam: string;
  sam: string;
  som: string;
  competitionIntensity: "low" | "medium" | "high";
  growthTrend: "declining" | "stable" | "growing" | "booming";
  benchmarks: Array<{ metric: string; value: string }>;
}

export interface GrowthReport {
  id: string;
  domain: string;
  companyName: string;
  segment: string;
  businessModel: { type: string; description: string; revenueModel: string };
  growthScore: number;
  summary: string;
  icp: ICPPersona[];
  audienceChannels: AudienceChannel[];
  optimizations: Optimization[];
  organicStrategy: OrganicStrategy;
  paidStrategy: PaidStrategy;
  marketSize: MarketSize;
  trafficData: {
    monthlyVisits: string;
    topKeywords: string[];
    trafficSources: Array<{ source: string; percentage: number }>;
  } | null;
  quickWins: string[];
  createdAt: string;
  status: "completed" | "analyzing" | "pending" | "failed";
}

export const demoReports: GrowthReport[] = [
  {
    id: "demo-stripe",
    domain: "stripe.com",
    companyName: "Stripe",
    segment: "Financial Infrastructure / Payments",
    businessModel: {
      type: "SaaS / API-Platform",
      description: "Stripe provides payment processing infrastructure as a service. Revenue is generated through transaction fees (2.9% + 30¢ per successful charge) and subscription-based products for advanced features like Billing, Connect, and Atlas.",
      revenueModel: "Transaction-based",
    },
    growthScore: 92,
    summary: "Stripe has built a dominant position in API-first payment infrastructure through developer-first positioning and product-led growth. The website effectively communicates technical value propositions but underutilizes case study content relative to enterprise deal values.",
    icp: [
      {
        name: "Tech-Savvy Startup Founder",
        role: "CTO / Technical Co-Founder",
        demographics: "25–40, urban, US/EU, Series A–C funded",
        painPoints: [
          "Needs payment integration that works out of the box with minimal setup",
          "Frustrated by legacy payment providers with poor documentation",
          "Requires multi-currency support for global expansion",
          "Wants to avoid vendor lock-in but values reliability",
        ],
        goals: [
          "Launch payment acceptance within a day",
          "Scale from MVP to millions of transactions without re-platforming",
          "Access detailed financial analytics and reporting",
        ],
        size: "large",
        priority: "primary",
      },
      {
        name: "Enterprise Platform Architect",
        role: "VP Engineering / Platform Lead",
        demographics: "35–50, enterprise tech, $50M+ ARR companies",
        painPoints: [
          "Complex multi-party payment flows for marketplace models",
          "Compliance and regulatory requirements across jurisdictions",
          "Need for white-label payment solutions",
        ],
        goals: [
          "Consolidate payment infrastructure under one provider",
          "Reduce PCI compliance burden",
        ],
        size: "medium",
        priority: "primary",
      },
      {
        name: "E-Commerce Business Owner",
        role: "Founder / Head of Operations",
        demographics: "28–45, DTC brands, Shopify/WooCommerce users",
        painPoints: [
          "Checkout abandonment due to limited payment methods",
          "High transaction fees cutting into margins",
          "Difficulty managing subscriptions and recurring billing",
        ],
        goals: [
          "Maximize checkout conversion rates",
          "Offer flexible payment options (BNPL, Apple Pay, etc.)",
        ],
        size: "large",
        priority: "secondary",
      },
    ],
    audienceChannels: [
      { platform: "Hacker News", relevance: 92, tip: "Post technical deep-dives on payment infrastructure. Developer audience overlaps heavily with Stripe's ICP.", category: "community" },
      { platform: "GitHub", relevance: 88, tip: "Open-source SDKs and example integrations drive discovery. Maintain active repos with quick issue response.", category: "community" },
      { platform: "Twitter/X", relevance: 78, tip: "Developer Twitter is a key channel. Share changelog updates, technical insights, and engage with dev influencers.", category: "social" },
      { platform: "Stack Overflow", relevance: 85, tip: "High-intent developers search for payment integration help. Official answers build trust and visibility.", category: "community" },
      { platform: "LinkedIn", relevance: 65, tip: "Target enterprise decision-makers with case studies and ROI content. Less relevant for developer acquisition.", category: "social" },
      { platform: "Google Search", relevance: 95, tip: "Dominate 'payment API' and 'accept payments online' queries. Technical documentation ranks organically.", category: "search" },
      { platform: "Dev.to / Medium", relevance: 60, tip: "Publish integration tutorials and comparison articles. Lower priority but builds long-tail SEO.", category: "content" },
    ],
    optimizations: [
      {
        area: "CTA Clarity",
        currentState: "Strong — 'Start now' and 'Contact sales' are clearly separated",
        recommendation: "Add a secondary CTA for 'See a demo' on the enterprise page. Many enterprise buyers want to see the product before engaging sales.",
        priority: "medium",
        impact: "medium",
      },
      {
        area: "Social Proof",
        currentState: "Customer logos present but case studies are limited",
        recommendation: "Add 3–5 detailed customer success stories with specific metrics (e.g., '40% checkout conversion increase'). Enterprise buyers need quantified ROI.",
        priority: "high",
        impact: "high",
      },
      {
        area: "Content Gaps",
        currentState: "Technical docs are best-in-class, but blog content is infrequent",
        recommendation: "Increase blog publishing cadence to 2x/week. Focus on use-case-driven content: 'How to build a marketplace with Stripe Connect', 'Subscription billing best practices'.",
        priority: "medium",
        impact: "high",
      },
      {
        area: "Trust Elements",
        currentState: "PCI compliance and SOC certifications mentioned but not prominent",
        recommendation: "Add a dedicated security/compliance page with downloadable SOC reports. Enterprise buyers actively look for this during evaluation.",
        priority: "high",
        impact: "medium",
      },
      {
        area: "Funnel Optimization",
        currentState: "Free sandbox to self-serve works well for SMB",
        recommendation: "Add an interactive pricing calculator on the pricing page. Transparency reduces friction for mid-market buyers comparing options.",
        priority: "low",
        impact: "medium",
      },
    ],
    organicStrategy: {
      seo: {
        score: 88,
        keywords: ["payment API", "online payments", "accept payments online", "payment processing", "Stripe alternatives"],
        recommendation: "Already strong in branded and head terms. Opportunity in long-tail queries: 'best payment gateway for SaaS', 'how to accept crypto payments', 'Stripe vs Square for marketplaces'.",
      },
      content: {
        formats: ["Technical Documentation", "Blog Articles", "Case Studies", "API Reference", "Video Tutorials"],
        topics: ["Payment integration guides", "Compliance and security", "Marketplace payment flows", "Subscription billing", "International expansion"],
        frequency: "Current: ~1x/week blog posts. Recommended: 2–3x/week with a mix of technical and business content.",
      },
      social: {
        platforms: ["Twitter/X", "LinkedIn", "YouTube"],
        contentTypes: ["Changelog updates", "Technical threads", "Customer stories", "Product announcements"],
        cadence: "Twitter: daily. LinkedIn: 2–3x/week. YouTube: bi-weekly tutorials.",
      },
      community: {
        channels: ["Discord (developer community)", "GitHub Discussions", "Stack Overflow"],
        approach: "Maintain official presence with fast response times. Sponsor developer events and hackathons. Build a developer advocacy program.",
      },
    },
    paidStrategy: {
      recommendedChannels: [
        { channel: "Google Ads", budgetLevel: "high", format: "Search ads on high-intent keywords", targetingTip: "Target 'payment API', 'accept payments', 'Stripe alternative'. Exclude branded queries." },
        { channel: "LinkedIn Ads", budgetLevel: "medium", format: "Sponsored content + InMail", targetingTip: "Target CTOs and VP Eng at $10M+ ARR SaaS companies. Use case study content." },
        { channel: "Twitter/X Ads", budgetLevel: "low", format: "Promoted tweets", targetingTip: "Target developer accounts. Promote new features and integration guides." },
        { channel: "YouTube Ads", budgetLevel: "medium", format: "Pre-roll on tech channels", targetingTip: "Target viewers of coding tutorials and SaaS review channels." },
      ],
      competitionLevel: "high",
      estimatedCPC: "$4.50–$12.00 for payment-related keywords",
    },
    marketSize: {
      tam: "$120B global payment processing market",
      sam: "$15B API-first payment infrastructure",
      som: "$2.5B developer-focused payment platforms",
      competitionIntensity: "high",
      growthTrend: "growing",
      benchmarks: [
        { metric: "Average conversion rate", value: "2.5–4.0% for payment pages" },
        { metric: "Industry CAC", value: "$150–$400 for SMB, $2,000–$8,000 for enterprise" },
        { metric: "Avg. monthly traffic (top 5)", value: "30M–80M visits" },
        { metric: "Content publishing frequency", value: "1–3x/week among leaders" },
      ],
    },
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
    quickWins: [
      "Add 3–5 detailed case studies with quantified metrics to improve enterprise conversion.",
      "Create a dedicated security and compliance page with downloadable SOC 2 reports.",
      "Increase blog publishing to 2x/week with use-case-driven content for long-tail SEO.",
      "Build an interactive pricing calculator to reduce friction for mid-market buyers.",
    ],
    createdAt: "2025-02-05T14:30:00Z",
    status: "completed",
  },
  {
    id: "demo-notion",
    domain: "notion.so",
    companyName: "Notion",
    segment: "Productivity / Collaboration",
    businessModel: {
      type: "Freemium SaaS",
      description: "Notion offers a free personal plan with limited features. Revenue comes from team and business subscriptions with per-user pricing. The product combines notes, docs, wikis, and project management into one workspace.",
      revenueModel: "Subscription (per-user)",
    },
    growthScore: 87,
    summary: "Notion dominates the workspace consolidation trend through bottom-up adoption. The template marketplace is an underutilized but high-impact organic channel. Comparison content targeting frustrated users of competing tools represents a significant SEO opportunity.",
    icp: [
      {
        name: "Knowledge Worker / Freelancer",
        role: "Designer, Writer, Consultant",
        demographics: "22–35, remote-first, digital-native, US/EU/Asia",
        painPoints: [
          "Scattered workflows across too many apps (Google Docs, Trello, Evernote)",
          "Lack of a central place for notes, tasks, and project documentation",
          "Templates and workflows that don't fit personal style",
        ],
        goals: [
          "Consolidate all work into a single, customizable workspace",
          "Build reusable templates for recurring workflows",
        ],
        size: "large",
        priority: "primary",
      },
      {
        name: "Startup Team Lead",
        role: "Head of Product / Engineering Manager",
        demographics: "28–40, startup teams of 5–50, Series A/B",
        painPoints: [
          "Team alignment suffers with docs spread across Confluence, Slack, and Google Drive",
          "Onboarding new team members takes too long without centralized knowledge",
          "Existing tools feel bloated and slow for small teams",
        ],
        goals: [
          "Create a single source of truth for team documentation",
          "Streamline sprint planning, roadmaps, and standup notes",
        ],
        size: "medium",
        priority: "primary",
      },
    ],
    audienceChannels: [
      { platform: "YouTube", relevance: 90, tip: "Template walkthroughs and 'How I use Notion' videos drive massive organic reach. Partner with productivity creators.", category: "content" },
      { platform: "Twitter/X", relevance: 80, tip: "Notion tips and template threads go viral. Engage with the creator community and reshare user content.", category: "social" },
      { platform: "Reddit (r/Notion)", relevance: 85, tip: "Active community sharing templates and workflows. Official presence here builds trust and drives feature discovery.", category: "community" },
      { platform: "Template Marketplace", relevance: 88, tip: "Community-created templates are a primary discovery channel. Invest in featuring top creators and curating collections.", category: "content" },
      { platform: "Google Search", relevance: 82, tip: "Target 'best note-taking app', 'Notion vs Confluence', and workflow-specific queries.", category: "search" },
      { platform: "Product Hunt", relevance: 55, tip: "Good for major feature launches but limited ongoing impact.", category: "community" },
    ],
    optimizations: [
      {
        area: "Comparison Pages",
        currentState: "Missing — no dedicated 'Notion vs Confluence' or 'Notion vs Coda' pages",
        recommendation: "Create SEO-optimized comparison landing pages targeting high-intent switching queries. Include feature-by-feature tables and migration guides.",
        priority: "high",
        impact: "high",
      },
      {
        area: "Enterprise Messaging",
        currentState: "Enterprise tier exists but messaging focuses on individual users",
        recommendation: "Add dedicated enterprise landing pages with security certifications, SSO details, and admin control features prominently displayed.",
        priority: "high",
        impact: "medium",
      },
      {
        area: "Onboarding Flow",
        currentState: "Strong for individuals, complex for teams",
        recommendation: "Create team-specific onboarding templates that auto-populate when a team signs up. Reduce time-to-value for team accounts.",
        priority: "medium",
        impact: "high",
      },
    ],
    organicStrategy: {
      seo: {
        score: 78,
        keywords: ["notion", "project management", "note taking app", "team wiki", "notion templates"],
        recommendation: "Strong branded search but weak in comparative queries. Create 'Notion vs X' content for Confluence, Coda, Obsidian, and Monday.com.",
      },
      content: {
        formats: ["Templates", "Blog", "YouTube Videos", "Community Forums", "Webinars"],
        topics: ["Productivity workflows", "Team collaboration", "Personal knowledge management", "Template showcases"],
        frequency: "Current: 1x/week. Recommended: 3x/week with template-focused and comparison content.",
      },
      social: {
        platforms: ["Twitter/X", "YouTube", "TikTok"],
        contentTypes: ["Template showcases", "Productivity tips", "User stories", "Feature updates"],
        cadence: "Twitter: daily. YouTube: weekly. TikTok: 2–3x/week short-form.",
      },
      community: {
        channels: ["Reddit r/Notion", "Discord", "Notion Ambassador Program"],
        approach: "Empower creator community. Feature top template makers. Run monthly challenges.",
      },
    },
    paidStrategy: {
      recommendedChannels: [
        { channel: "Google Ads", budgetLevel: "high", format: "Search ads", targetingTip: "Target 'best project management tool', 'Confluence alternative', 'team wiki software'." },
        { channel: "YouTube Ads", budgetLevel: "medium", format: "Pre-roll on productivity channels", targetingTip: "Target viewers of productivity and remote work content." },
        { channel: "Instagram/TikTok", budgetLevel: "low", format: "Short-form video ads", targetingTip: "Target 22–30 knowledge workers with aesthetic workspace content." },
      ],
      competitionLevel: "medium",
      estimatedCPC: "$2.00–$6.00 for productivity tool keywords",
    },
    marketSize: {
      tam: "$45B global productivity software market",
      sam: "$12B collaborative workspace tools",
      som: "$3B all-in-one workspace platforms",
      competitionIntensity: "medium",
      growthTrend: "booming",
      benchmarks: [
        { metric: "Average conversion rate", value: "3–5% free-to-paid" },
        { metric: "Industry CAC", value: "$80–$200 for SMB" },
        { metric: "Avg. monthly traffic (top 5)", value: "50M–200M visits" },
        { metric: "Template marketplace impact", value: "15–25% of new user acquisition" },
      ],
    },
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
    quickWins: [
      "Create 'Notion vs X' comparison pages for top 5 competitors — high-intent SEO opportunity.",
      "Launch team-specific onboarding templates to reduce time-to-value for new team signups.",
      "Invest in short-form video content (TikTok, YouTube Shorts) — productivity tips and template showcases.",
    ],
    createdAt: "2025-02-04T09:15:00Z",
    status: "completed",
  },
  {
    id: "demo-linear",
    domain: "linear.app",
    companyName: "Linear",
    segment: "Developer Tools / Project Management",
    businessModel: {
      type: "Freemium SaaS",
      description: "Linear offers a free tier for small teams and charges per-user for larger teams. Focus on speed and developer experience for issue tracking and project management.",
      revenueModel: "Subscription (per-user)",
    },
    growthScore: 81,
    summary: "Linear has carved out a strong niche by positioning against legacy tools through speed and UX. Word-of-mouth in the dev community is the primary growth driver. Video content (YouTube) is a largely untapped channel across the entire segment.",
    icp: [
      {
        name: "Engineering Team Lead",
        role: "Staff Engineer / Engineering Manager",
        demographics: "28–42, software teams of 5–30, startup to mid-market",
        painPoints: [
          "Jira is slow, bloated, and kills developer productivity",
          "Context switching between too many tools for planning, tracking, and communication",
          "Sprint ceremonies feel bureaucratic instead of productive",
        ],
        goals: [
          "Ship faster with less process overhead",
          "Give developers a tool they actually enjoy using",
          "Track velocity and project progress without micromanagement",
        ],
        size: "medium",
        priority: "primary",
      },
      {
        name: "Product Manager at Startup",
        role: "PM / Technical PM",
        demographics: "26–38, product teams at fast-moving startups",
        painPoints: [
          "Roadmap tools are disconnected from actual engineering work",
          "Difficulty aligning product priorities with engineering capacity",
        ],
        goals: [
          "Manage roadmaps and backlogs in one keyboard-driven interface",
          "Create visibility across product and engineering without extra meetings",
        ],
        size: "small",
        priority: "secondary",
      },
    ],
    audienceChannels: [
      { platform: "Twitter/X", relevance: 92, tip: "Dev Twitter is where Linear's reputation was built. Continue engaging with developers, sharing product updates, and amplifying user praise.", category: "social" },
      { platform: "Hacker News", relevance: 88, tip: "Launch posts, changelogs, and opinionated product posts perform well. Authentic voice matters more than marketing polish here.", category: "community" },
      { platform: "Word of Mouth", relevance: 95, tip: "Developers recommend Linear to their peers. Amplify this with a referral program or 'invite your team' flow.", category: "community" },
      { platform: "GitHub", relevance: 72, tip: "Integrations and open-source tooling around Linear. Maintain active presence.", category: "community" },
      { platform: "YouTube", relevance: 45, tip: "Largely untapped. Developer workflow videos and 'Linear vs Jira' comparisons could capture high-intent search traffic.", category: "content" },
    ],
    optimizations: [
      {
        area: "SEO Comparison Content",
        currentState: "No 'Linear vs Jira' or 'Linear vs Shortcut' pages exist",
        recommendation: "Create detailed comparison pages targeting developers actively searching for Jira alternatives. Include migration guides and feature tables.",
        priority: "high",
        impact: "high",
      },
      {
        area: "Video Content",
        currentState: "Minimal video presence on YouTube",
        recommendation: "Produce bi-weekly developer workflow videos: 'How we use Linear at [Company]', sprint planning demos, and keyboard shortcut deep-dives.",
        priority: "medium",
        impact: "high",
      },
      {
        area: "Enterprise Landing Page",
        currentState: "Enterprise tier exists but lacks dedicated positioning",
        recommendation: "Create an enterprise-focused page with SOC 2 compliance, SSO, audit logs, and customer logos from 100+ employee companies.",
        priority: "medium",
        impact: "medium",
      },
    ],
    organicStrategy: {
      seo: {
        score: 62,
        keywords: ["issue tracker", "Jira alternative", "linear app", "project management for developers"],
        recommendation: "Weak in non-branded queries. Build content around 'best issue tracker for developers', 'Jira alternatives 2025', and workflow-specific tutorials.",
      },
      content: {
        formats: ["Blog", "Changelog", "Product Updates", "Twitter Threads"],
        topics: ["Engineering velocity", "Sprint planning best practices", "Developer experience", "Product management workflows"],
        frequency: "Current: bi-weekly. Recommended: weekly blog + weekly video content.",
      },
      social: {
        platforms: ["Twitter/X", "LinkedIn"],
        contentTypes: ["Product updates", "Engineering culture posts", "User testimonials", "Technical insights"],
        cadence: "Twitter: daily. LinkedIn: 2x/week targeting engineering managers.",
      },
      community: {
        channels: ["Hacker News", "Discord (private beta)", "Dev conferences"],
        approach: "Maintain authentic, developer-first voice. Sponsor relevant conferences (React Summit, GitHub Universe). Build a developer advocate program.",
      },
    },
    paidStrategy: {
      recommendedChannels: [
        { channel: "Google Ads", budgetLevel: "medium", format: "Search ads", targetingTip: "Target 'Jira alternative', 'fast issue tracker', 'project management for engineering teams'." },
        { channel: "Twitter/X Ads", budgetLevel: "low", format: "Promoted tweets", targetingTip: "Target followers of competing tools and developer influencers." },
      ],
      competitionLevel: "medium",
      estimatedCPC: "$3.00–$8.00 for developer tool keywords",
    },
    marketSize: {
      tam: "$18B project management software market",
      sam: "$4B developer-focused PM tools",
      som: "$800M keyboard-driven issue trackers",
      competitionIntensity: "medium",
      growthTrend: "growing",
      benchmarks: [
        { metric: "Average conversion rate", value: "5–8% free-to-paid (dev tools)" },
        { metric: "Industry CAC", value: "$50–$150 for SMB dev teams" },
        { metric: "Word-of-mouth impact", value: "60–70% of new signups in this segment" },
        { metric: "Avg. team size at conversion", value: "8–15 members" },
      ],
    },
    trafficData: null,
    quickWins: [
      "Create 'Linear vs Jira' and 'Linear vs Shortcut' comparison pages for high-intent SEO traffic.",
      "Launch a YouTube channel with bi-weekly developer workflow videos.",
      "Add a 'Jira migration' one-click import tool prominently on the homepage.",
    ],
    createdAt: "2025-02-03T16:45:00Z",
    status: "completed",
  },
];

export const demoScans = demoReports.map((g) => ({
  id: g.id,
  domain: g.domain,
  companyName: g.companyName,
  segment: g.segment,
  businessModel: g.businessModel.type,
  growthScore: g.growthScore,
  sectionsCompleted: g.status === "completed" ? 7 : g.status === "analyzing" ? 4 : 0,
  totalSections: 7,
  status: g.status,
  createdAt: g.createdAt,
}));
