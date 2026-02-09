export interface ICPPersona {
  name: string;
  role: string;
  demographics: string;
  painPoints: string[];
  goals: string[];
  buyingTriggers: string[];
  objections: string[];
  whereToFind: string[];
  size: "small" | "medium" | "large";
  priority: "primary" | "secondary";
}

export interface AudienceChannel {
  platform: string;
  relevance: number;
  tip: string;
  category: "social" | "community" | "search" | "content" | "paid";
  specificLinks: string[];
  recommendedKeywords: string[];
  bestFormats: string[];
  postingFrequency: string;
  budgetLevel?: "low" | "medium" | "high";
  estimatedCPC?: string;
}

export interface Optimization {
  area: string;
  currentState: string;
  recommendation: string;
  priority: "high" | "medium" | "low";
  impact: "high" | "medium" | "low";
  effort: string;
  expectedOutcome: string;
}

export interface SEOKeyword {
  keyword: string;
  volume: string;
  difficulty: "low" | "medium" | "high";
  opportunity: "low" | "medium" | "high";
}

export interface PerformanceScores {
  seo: number;
  content: number;
  social: number;
  paid: number;
  trust: number;
  funnel: number;
}

export interface IndustryBenchmark {
  metric: string;
  value: string;
}

export interface ScoreInsight {
  key: keyof PerformanceScores;
  insight: string;
  nextStep: string;
}

export interface GrowthReport {
  id: string;
  domain: string;
  companyName: string;
  segment: string;
  businessModel: {
    type: string;
    description: string;
    revenueModel: string;
    positioning: string;
    differentiators: string[];
    growthLever: string;
  };
  growthScore: number;
  summary: string;
  topPriorities: string[];
  icp: ICPPersona[];
  audienceChannels: AudienceChannel[];
  optimizations: Optimization[];
  seoKeywords: SEOKeyword[];
  seoScore: number;
  seoRecommendation: string;
  paidCompetitionLevel: "low" | "medium" | "high";
  estimatedCPC: string;
  performanceScores: PerformanceScores;
  industryAverage: PerformanceScores;
  industryBenchmarks: IndustryBenchmark[];
  scoreInsights: ScoreInsight[];
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
      positioning: "The developer-first payments platform that scales from startup to enterprise — replacing legacy payment providers with a single API.",
      differentiators: [
        "Best-in-class developer documentation and API design",
        "Full-stack financial infrastructure (payments, billing, treasury, identity)",
        "Global coverage with 135+ currencies and local payment methods",
        "Product-led growth through self-serve onboarding",
      ],
      growthLever: "Product-Led Growth",
    },
    growthScore: 92,
    summary: "Stripe has built a dominant position in API-first payment infrastructure through developer-first positioning and product-led growth. The website effectively communicates technical value propositions but underutilizes case study content relative to enterprise deal values.",
    topPriorities: [
      "Add 3–5 detailed customer case studies with quantified ROI metrics to convert enterprise buyers.",
      "Create a dedicated security/compliance page with downloadable SOC 2 reports — enterprise buyers actively look for this.",
      "Increase blog cadence to 2x/week with use-case-driven content for long-tail SEO growth.",
    ],
    performanceScores: { seo: 88, content: 72, social: 65, paid: 78, trust: 85, funnel: 90 },
    industryAverage: { seo: 65, content: 55, social: 50, paid: 60, trust: 70, funnel: 68 },
    industryBenchmarks: [
      { metric: "Average conversion rate", value: "2.5–4.0% for payment pages" },
      { metric: "Industry CAC", value: "$150–$400 (SMB), $2,000–$8,000 (Enterprise)" },
      { metric: "Content publishing frequency", value: "1–3x/week among leaders" },
      { metric: "Avg. monthly traffic (top 5)", value: "30M–80M visits" },
    ],
    scoreInsights: [
      { key: "seo", insight: "Strong — dominant in branded and head terms. Opportunity in long-tail comparison queries.", nextStep: "Create comparison landing pages for 'Stripe vs PayPal' and 'Stripe vs Square' to capture high-intent traffic." },
      { key: "content", insight: "Below potential — docs are excellent but blog cadence is too low for the market.", nextStep: "Increase blog output to 2x/week focusing on use-case-driven content and integration tutorials." },
      { key: "social", insight: "Developer Twitter engagement is solid but LinkedIn enterprise content is weak.", nextStep: "Launch a LinkedIn content series targeting CTOs and VP Engineering with enterprise case studies." },
      { key: "paid", insight: "Well-optimized search ads. LinkedIn and YouTube campaigns could scale enterprise pipeline.", nextStep: "Test LinkedIn sponsored content with enterprise case studies — target $10M+ ARR SaaS companies." },
      { key: "trust", insight: "Strong technical reputation. Formalizing compliance page would close enterprise gaps.", nextStep: "Build a dedicated /security page with downloadable SOC 2 Type II reports and compliance certifications." },
      { key: "funnel", insight: "Excellent self-serve funnel. Adding a pricing calculator would reduce mid-market friction.", nextStep: "Add an interactive pricing calculator on the pricing page for transparent cost estimation." },
    ],
    seoKeywords: [
      { keyword: "payment API", volume: "18,000/mo", difficulty: "high", opportunity: "medium" },
      { keyword: "online payments", volume: "45,000/mo", difficulty: "high", opportunity: "low" },
      { keyword: "accept payments online", volume: "12,000/mo", difficulty: "medium", opportunity: "high" },
      { keyword: "payment processing", volume: "33,000/mo", difficulty: "high", opportunity: "low" },
      { keyword: "Stripe alternatives", volume: "8,500/mo", difficulty: "medium", opportunity: "high" },
      { keyword: "best payment gateway for SaaS", volume: "3,200/mo", difficulty: "low", opportunity: "high" },
      { keyword: "Stripe vs Square", volume: "6,800/mo", difficulty: "medium", opportunity: "high" },
    ],
    seoScore: 88,
    seoRecommendation: "Already strong in branded and head terms. Opportunity in long-tail queries: 'best payment gateway for SaaS', 'how to accept crypto payments', 'Stripe vs Square for marketplaces'.",
    paidCompetitionLevel: "high",
    estimatedCPC: "$4.50–$12.00 for payment-related keywords",
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
        buyingTriggers: [
          "Series A funding secured — need to professionalize payment stack",
          "Launching in new international markets requiring local payment methods",
          "Current payment provider fails during traffic spikes",
        ],
        objections: [
          "Transaction fees are higher than some competitors (2.9% + 30¢)",
          "Concerned about vendor lock-in with proprietary APIs",
          "Support response times for non-enterprise tiers",
        ],
        whereToFind: [
          "Hacker News (Show HN launches, payment discussions)",
          "GitHub (searching for payment SDKs and starter templates)",
          "Dev Twitter (@stripe, #fintech, payment API threads)",
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
        buyingTriggers: [
          "Board mandate to consolidate payment vendors for cost reduction",
          "Expanding into EU/APAC markets requiring local compliance",
          "Current provider contract renewal approaching",
        ],
        objections: [
          "Migration complexity from existing payment infrastructure",
          "Need dedicated enterprise support SLAs before committing",
          "Concerns about custom feature requests and roadmap influence",
        ],
        whereToFind: [
          "LinkedIn (VP Engineering groups, Fintech Professionals)",
          "Industry conferences (Money 20/20, SaaStr Annual)",
          "Gartner/Forrester reports on payment infrastructure",
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
        buyingTriggers: [
          "Checkout abandonment rate exceeds 70% — need better payment UX",
          "Launching subscription/recurring billing for the first time",
          "Shopify Payments limitations blocking international sales",
        ],
        objections: [
          "Already invested in Shopify Payments ecosystem",
          "Technical integration seems complex for non-developer teams",
          "Unclear pricing for high-volume transaction discounts",
        ],
        whereToFind: [
          "Shopify community forums and r/shopify",
          "E-commerce Twitter (#DTC, #ecommerce, Shopify creators)",
          "Product Hunt (searching for checkout optimization tools)",
        ],
        size: "large",
        priority: "secondary",
      },
    ],
    audienceChannels: [
      {
        platform: "Hacker News",
        relevance: 92,
        tip: "Post technical deep-dives on payment infrastructure. Developer audience overlaps heavily with Stripe's ICP.",
        category: "community",
        specificLinks: ["news.ycombinator.com (Show HN posts)", "Hacker News: Who is hiring?", "HN: Ask – Payment integrations"],
        recommendedKeywords: ["payment API", "Stripe SDK", "fintech infrastructure", "PCI DSS"],
        bestFormats: ["Technical deep-dives", "Show HN launches", "Architecture breakdowns"],
        postingFrequency: "2–3x/week",
      },
      {
        platform: "GitHub",
        relevance: 88,
        tip: "Open-source SDKs and example integrations drive discovery. Maintain active repos with quick issue response.",
        category: "community",
        specificLinks: ["github.com/stripe", "github.com/stripe-samples", "github.com/stripe/stripe-node"],
        recommendedKeywords: ["stripe-node", "payment integration example", "checkout session"],
        bestFormats: ["Example repos", "Integration templates", "Issue responses within 24h"],
        postingFrequency: "Daily (issue triage), weekly (new examples)",
      },
      {
        platform: "Twitter/X",
        relevance: 78,
        tip: "Developer Twitter is a key channel. Share changelog updates, technical insights, and engage with dev influencers.",
        category: "social",
        specificLinks: ["@stripe", "@stripeDev", "Dev Twitter community", "#fintech hashtag"],
        recommendedKeywords: ["payment API launch", "Stripe checkout", "developer tools"],
        bestFormats: ["Changelog threads", "Technical insight threads", "Customer win retweets"],
        postingFrequency: "Daily",
      },
      {
        platform: "Stack Overflow",
        relevance: 85,
        tip: "High-intent developers search for payment integration help. Official answers build trust and visibility.",
        category: "community",
        specificLinks: ["stackoverflow.com/questions/tagged/stripe-payments", "stackoverflow.com/questions/tagged/stripe-api"],
        recommendedKeywords: ["stripe webhook", "stripe checkout session", "stripe subscription"],
        bestFormats: ["Official verified answers", "Code snippets with context", "Migration guides"],
        postingFrequency: "Daily monitoring, 5–10 answers/week",
      },
      {
        platform: "LinkedIn",
        relevance: 65,
        tip: "Target enterprise decision-makers with case studies and ROI content. Less relevant for developer acquisition.",
        category: "social",
        specificLinks: ["LinkedIn Groups: Fintech Professionals", "LinkedIn Groups: SaaS Founders", "Stripe company page"],
        recommendedKeywords: ["payment infrastructure ROI", "enterprise payments", "marketplace payments"],
        bestFormats: ["Case study posts", "ROI calculators", "Enterprise feature announcements"],
        postingFrequency: "2–3x/week",
      },
      {
        platform: "Google Search",
        relevance: 95,
        tip: "Dominate 'payment API' and 'accept payments online' queries. Technical documentation ranks organically.",
        category: "search",
        specificLinks: ["stripe.com/docs (primary landing)", "stripe.com/use-cases", "stripe.com/customers"],
        recommendedKeywords: ["accept payments online", "payment gateway API", "best payment processor", "Stripe vs PayPal"],
        bestFormats: ["Long-form docs", "Comparison pages", "Use-case landing pages"],
        postingFrequency: "Continuous SEO optimization",
      },
      {
        platform: "Dev.to / Medium",
        relevance: 60,
        tip: "Publish integration tutorials and comparison articles. Lower priority but builds long-tail SEO.",
        category: "content",
        specificLinks: ["dev.to/stripe", "Medium: Stripe Engineering Blog", "dev.to/t/payments"],
        recommendedKeywords: ["Stripe tutorial", "payment integration guide", "webhook setup"],
        bestFormats: ["Step-by-step tutorials", "Integration comparison articles", "Troubleshooting guides"],
        postingFrequency: "1–2x/week",
      },
      {
        platform: "Google Ads",
        relevance: 80,
        tip: "Target high-intent keywords. Exclude branded queries to avoid wasted spend.",
        category: "paid",
        specificLinks: ["Google Ads Search Network", "Performance Max for SaaS"],
        recommendedKeywords: ["payment API", "accept payments", "Stripe alternative"],
        bestFormats: ["Search ads on high-intent keywords"],
        postingFrequency: "Always-on",
        budgetLevel: "high",
        estimatedCPC: "$8–$12",
      },
      {
        platform: "LinkedIn Ads",
        relevance: 70,
        tip: "Target CTOs and VP Eng at $10M+ ARR SaaS companies. Use case study content.",
        category: "paid",
        specificLinks: ["LinkedIn Campaign Manager", "Sponsored InMail"],
        recommendedKeywords: ["enterprise payments", "payment infrastructure", "SaaS billing"],
        bestFormats: ["Sponsored content + InMail"],
        postingFrequency: "Ongoing campaigns",
        budgetLevel: "medium",
        estimatedCPC: "$6–$10",
      },
    ],
    optimizations: [
      {
        area: "CTA Clarity",
        currentState: "Strong — 'Start now' and 'Contact sales' are clearly separated",
        recommendation: "Add a secondary CTA for 'See a demo' on the enterprise page. Many enterprise buyers want to see the product before engaging sales.",
        priority: "medium",
        impact: "medium",
        effort: "2–4 hours",
        expectedOutcome: "+10–15% enterprise page engagement and demo requests",
      },
      {
        area: "Social Proof",
        currentState: "Customer logos present but case studies are limited",
        recommendation: "Add 3–5 detailed customer success stories with specific metrics (e.g., '40% checkout conversion increase'). Enterprise buyers need quantified ROI.",
        priority: "high",
        impact: "high",
        effort: "1–2 weeks (content creation)",
        expectedOutcome: "+20–30% enterprise lead conversion from website",
      },
      {
        area: "Content Gaps",
        currentState: "Technical docs are best-in-class, but blog content is infrequent",
        recommendation: "Increase blog publishing cadence to 2x/week. Focus on use-case-driven content: 'How to build a marketplace with Stripe Connect', 'Subscription billing best practices'.",
        priority: "medium",
        impact: "high",
        effort: "Ongoing (hire content writer or agency)",
        expectedOutcome: "+30–50% organic traffic growth within 6 months",
      },
      {
        area: "Trust Elements",
        currentState: "PCI compliance and SOC certifications mentioned but not prominent",
        recommendation: "Add a dedicated security/compliance page with downloadable SOC reports. Enterprise buyers actively look for this during evaluation.",
        priority: "high",
        impact: "medium",
        effort: "1–2 days (page creation + asset upload)",
        expectedOutcome: "Reduced enterprise sales cycle by 1–2 weeks",
      },
      {
        area: "Funnel Optimization",
        currentState: "Free sandbox to self-serve works well for SMB",
        recommendation: "Add an interactive pricing calculator on the pricing page. Transparency reduces friction for mid-market buyers comparing options.",
        priority: "low",
        impact: "medium",
        effort: "1 week (calculator development)",
        expectedOutcome: "+15–20% pricing page conversion to signup",
      },
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
      positioning: "The all-in-one workspace that replaces Docs, Wikis, Trello, and Confluence — customizable to any team's workflow.",
      differentiators: [
        "Infinitely flexible block-based editor that adapts to any use case",
        "Massive template marketplace creating a self-sustaining content ecosystem",
        "Bottom-up adoption model — individuals bring Notion to their teams",
        "Cross-platform sync with offline mode and real-time collaboration",
      ],
      growthLever: "Community-Driven / Bottom-Up Adoption",
    },
    growthScore: 87,
    summary: "Notion dominates the workspace consolidation trend through bottom-up adoption. The template marketplace is an underutilized but high-impact organic channel. Comparison content targeting frustrated users of competing tools represents a significant SEO opportunity.",
    topPriorities: [
      "Create 'Notion vs X' comparison pages for top 5 competitors — high-intent SEO opportunity with fast results.",
      "Launch team-specific onboarding templates to reduce time-to-value for new team signups.",
      "Invest in short-form video content (TikTok, YouTube Shorts) for template showcases and productivity tips.",
    ],
    performanceScores: { seo: 78, content: 85, social: 82, paid: 55, trust: 75, funnel: 80 },
    industryAverage: { seo: 60, content: 58, social: 55, paid: 50, trust: 62, funnel: 60 },
    industryBenchmarks: [
      { metric: "Average conversion rate", value: "3–5% free-to-paid" },
      { metric: "Industry CAC", value: "$80–$200 for SMB" },
      { metric: "Template marketplace impact", value: "15–25% of new user acquisition" },
      { metric: "Avg. monthly traffic (top 5)", value: "50M–200M visits" },
    ],
    scoreInsights: [
      { key: "seo", insight: "Good branded search but missing comparison pages — 'Notion vs Confluence' has no dedicated landing.", nextStep: "Create 5 comparison landing pages targeting Confluence, Coda, Obsidian, Monday.com, and ClickUp." },
      { key: "content", insight: "Strong template ecosystem. Blog content could be more frequent and SEO-focused.", nextStep: "Publish 3x/week blog posts with SEO-optimized titles targeting 'best template for X' queries." },
      { key: "social", insight: "Viral template sharing on Twitter and TikTok. Community-driven growth is a major strength.", nextStep: "Double down on TikTok with 3x/week short-form template showcase videos." },
      { key: "paid", insight: "Below average — underinvesting in paid channels relative to market opportunity.", nextStep: "Test Google Ads on 'Confluence alternative' and 'team wiki' keywords with $5K/month budget." },
      { key: "trust", insight: "Trusted by individuals. Enterprise trust signals (SOC 2, SSO) need more visibility.", nextStep: "Add a dedicated /enterprise page highlighting security certifications and admin controls." },
      { key: "funnel", insight: "Excellent free-to-paid conversion for individuals. Team onboarding flow needs work.", nextStep: "Build team-specific onboarding templates that auto-populate on team signup." },
    ],
    seoKeywords: [
      { keyword: "notion", volume: "1,200,000/mo", difficulty: "high", opportunity: "low" },
      { keyword: "project management tool", volume: "40,000/mo", difficulty: "high", opportunity: "medium" },
      { keyword: "note taking app", volume: "28,000/mo", difficulty: "medium", opportunity: "high" },
      { keyword: "team wiki", volume: "9,500/mo", difficulty: "low", opportunity: "high" },
      { keyword: "Notion vs Confluence", volume: "6,200/mo", difficulty: "low", opportunity: "high" },
      { keyword: "notion templates", volume: "55,000/mo", difficulty: "medium", opportunity: "medium" },
    ],
    seoScore: 78,
    seoRecommendation: "Strong branded search but weak in comparative queries. Create 'Notion vs X' content for Confluence, Coda, Obsidian, and Monday.com.",
    paidCompetitionLevel: "medium",
    estimatedCPC: "$2.00–$6.00 for productivity tool keywords",
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
        buyingTriggers: [
          "Starting a new freelance project and needing a structured system",
          "Hitting the free tier limit after heavy personal use",
          "Colleague or influencer recommendation on social media",
        ],
        objections: [
          "Free tier might be enough — hard to justify paying as an individual",
          "Learning curve for advanced features like databases and relations",
          "Performance can feel slow with large workspaces",
        ],
        whereToFind: [
          "Reddit r/Notion and r/productivity",
          "YouTube (productivity YouTubers, template walkthroughs)",
          "Twitter/TikTok (#NotionTips, productivity creator community)",
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
        buyingTriggers: [
          "New hire wave — need to onboard 5+ people simultaneously",
          "Confluence license renewal triggering 'is there something better?' search",
          "Team member champions Notion and requests team upgrade",
        ],
        objections: [
          "Concern about Notion's scalability for 50+ person teams",
          "Missing granular permissions compared to enterprise wikis",
          "Data export and backup options feel limited",
        ],
        whereToFind: [
          "Product Hunt (searching for team collaboration tools)",
          "LinkedIn (Head of Product groups, startup founder communities)",
          "SaaS review sites (G2, Capterra — comparing wiki tools)",
        ],
        size: "medium",
        priority: "primary",
      },
    ],
    audienceChannels: [
      {
        platform: "YouTube",
        relevance: 90,
        tip: "Template walkthroughs and 'How I use Notion' videos drive massive organic reach. Partner with productivity creators.",
        category: "content",
        specificLinks: ["Thomas Frank channel", "Notion YouTube channel", "Keep Productive", "Marie Poulin – Notion Mastery"],
        recommendedKeywords: ["Notion tutorial", "Notion setup", "Notion template walkthrough", "Notion vs Obsidian"],
        bestFormats: ["Template walkthroughs (10–15 min)", "Workspace tours", "'How I use Notion' vlogs"],
        postingFrequency: "Weekly",
      },
      {
        platform: "Twitter/X",
        relevance: 80,
        tip: "Notion tips and template threads go viral. Engage with the creator community and reshare user content.",
        category: "social",
        specificLinks: ["@NotionHQ", "#NotionTips hashtag", "Notion Creators community", "@NotionAmo"],
        recommendedKeywords: ["Notion tips", "Notion template", "productivity workspace"],
        bestFormats: ["Tip threads (5–7 tweets)", "Template screenshot carousels", "Before/after workspace transformations"],
        postingFrequency: "Daily",
      },
      {
        platform: "Reddit",
        relevance: 85,
        tip: "Active community sharing templates and workflows. Official presence here builds trust and drives feature discovery.",
        category: "community",
        specificLinks: ["r/Notion (500K+ members)", "r/productivity", "r/DigitalPlanning", "r/selfimprovement"],
        recommendedKeywords: ["Notion template share", "Notion workflow", "Notion database"],
        bestFormats: ["Template shares with screenshots", "Workflow breakdowns", "Use-case-specific guides"],
        postingFrequency: "3–4x/week",
      },
      {
        platform: "Template Marketplace",
        relevance: 88,
        tip: "Community-created templates are a primary discovery channel. Invest in featuring top creators and curating collections.",
        category: "content",
        specificLinks: ["notion.so/templates", "Gumroad Notion templates", "Etsy Notion templates", "Notion Creator ecosystem"],
        recommendedKeywords: ["Notion template", "project management template", "habit tracker Notion"],
        bestFormats: ["Curated collections", "Creator spotlights", "Seasonal template drops"],
        postingFrequency: "Continuous curation",
      },
      {
        platform: "Google Search",
        relevance: 82,
        tip: "Target 'best note-taking app', 'Notion vs Confluence', and workflow-specific queries.",
        category: "search",
        specificLinks: ["notion.so/product (landing)", "notion.so/teams", "notion.so/enterprise"],
        recommendedKeywords: ["best note-taking app", "Notion vs Confluence", "team wiki software", "project management tool"],
        bestFormats: ["Comparison pages", "Use-case landing pages", "SEO-optimized blog posts"],
        postingFrequency: "Continuous SEO optimization",
      },
      {
        platform: "Product Hunt",
        relevance: 55,
        tip: "Good for major feature launches but limited ongoing impact.",
        category: "community",
        specificLinks: ["producthunt.com/products/notion", "Product Hunt Collections: Productivity"],
        recommendedKeywords: ["Notion launch", "all-in-one workspace", "productivity tool"],
        bestFormats: ["Major feature launches", "Year-end roundups"],
        postingFrequency: "2–3x/year for big launches",
      },
      {
        platform: "Google Ads",
        relevance: 65,
        tip: "Target 'Confluence alternative' and 'team wiki software' for high-intent team signups.",
        category: "paid",
        specificLinks: ["Google Ads Search Network"],
        recommendedKeywords: ["best project management tool", "Confluence alternative", "team wiki software"],
        bestFormats: ["Search ads"],
        postingFrequency: "Always-on",
        budgetLevel: "high",
        estimatedCPC: "$3–$6",
      },
      {
        platform: "YouTube Ads",
        relevance: 55,
        tip: "Pre-roll on productivity channels. Target viewers of remote work and productivity content.",
        category: "paid",
        specificLinks: ["YouTube Ads (pre-roll)"],
        recommendedKeywords: ["productivity tool", "workspace app", "team collaboration"],
        bestFormats: ["Pre-roll on productivity channels"],
        postingFrequency: "Ongoing campaigns",
        budgetLevel: "medium",
        estimatedCPC: "$2–$4",
      },
    ],
    optimizations: [
      {
        area: "Comparison Pages",
        currentState: "Missing — no dedicated 'Notion vs Confluence' or 'Notion vs Coda' pages",
        recommendation: "Create SEO-optimized comparison landing pages targeting high-intent switching queries. Include feature-by-feature tables and migration guides.",
        priority: "high",
        impact: "high",
        effort: "3–5 days per page",
        expectedOutcome: "+25–40% organic traffic from comparison keywords within 3 months",
      },
      {
        area: "Enterprise Messaging",
        currentState: "Enterprise tier exists but messaging focuses on individual users",
        recommendation: "Add dedicated enterprise landing pages with security certifications, SSO details, and admin control features prominently displayed.",
        priority: "high",
        impact: "medium",
        effort: "1 week (design + copy)",
        expectedOutcome: "+15–20% enterprise demo requests from website",
      },
      {
        area: "Onboarding Flow",
        currentState: "Strong for individuals, complex for teams",
        recommendation: "Create team-specific onboarding templates that auto-populate when a team signs up. Reduce time-to-value for team accounts.",
        priority: "medium",
        impact: "high",
        effort: "2–3 weeks (product + design)",
        expectedOutcome: "+20% team activation rate within first week",
      },
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
      positioning: "The issue tracker built for speed — replacing Jira's complexity with a keyboard-first, opinionated workflow for modern engineering teams.",
      differentiators: [
        "Fastest UI in the category — native-app feel with keyboard shortcuts",
        "Opinionated workflows that reduce process overhead for dev teams",
        "Seamless GitHub, Slack, and Figma integrations",
        "Built by engineers for engineers — strong product-market fit in dev community",
      ],
      growthLever: "Word-of-Mouth / Developer Community",
    },
    growthScore: 81,
    summary: "Linear has carved out a strong niche by positioning against legacy tools through speed and UX. Word-of-mouth in the dev community is the primary growth driver. Video content (YouTube) is a largely untapped channel across the entire segment.",
    topPriorities: [
      "Create 'Linear vs Jira' and 'Linear vs Shortcut' comparison pages — highest ROI SEO opportunity.",
      "Launch a YouTube channel with bi-weekly developer workflow videos to capture untapped video search traffic.",
      "Add a prominent 'Jira migration' one-click import tool to convert competitor users.",
    ],
    performanceScores: { seo: 62, content: 55, social: 80, paid: 40, trust: 72, funnel: 85 },
    industryAverage: { seo: 58, content: 50, social: 48, paid: 45, trust: 60, funnel: 62 },
    industryBenchmarks: [
      { metric: "Average conversion rate", value: "5–8% free-to-paid (dev tools)" },
      { metric: "Industry CAC", value: "$50–$150 for SMB dev teams" },
      { metric: "Word-of-mouth impact", value: "60–70% of new signups" },
      { metric: "Avg. team size at conversion", value: "8–15 members" },
    ],
    scoreInsights: [
      { key: "seo", insight: "Weak in non-branded queries. No comparison pages exist — major missed opportunity.", nextStep: "Build 'Linear vs Jira' and 'Linear vs Shortcut' pages with feature comparison tables and migration guides." },
      { key: "content", insight: "Minimal blog presence. Changelog is good but insufficient for organic growth.", nextStep: "Publish weekly blog posts on engineering velocity, sprint planning, and developer workflow best practices." },
      { key: "social", insight: "Exceptional Dev Twitter presence. Word-of-mouth is the primary growth engine.", nextStep: "Amplify user testimonials and create a formal 'invite your team' referral flow." },
      { key: "paid", insight: "Underinvesting — but brand-driven growth may justify lower paid spend.", nextStep: "Test a small Google Ads budget ($3K/month) on 'Jira alternative' and 'fast issue tracker' keywords." },
      { key: "trust", insight: "Strong among developers. Enterprise trust signals (SOC 2, compliance) need dedicated page.", nextStep: "Create a /security page with SOC 2 Type II badge, audit logs documentation, and enterprise customer logos." },
      { key: "funnel", insight: "Excellent product-led funnel. Free tier converts well once teams experience the speed.", nextStep: "Add an in-app 'invite teammates' prompt after 7 days of active solo usage." },
    ],
    seoKeywords: [
      { keyword: "issue tracker", volume: "22,000/mo", difficulty: "high", opportunity: "medium" },
      { keyword: "Jira alternative", volume: "14,000/mo", difficulty: "medium", opportunity: "high" },
      { keyword: "linear app", volume: "18,000/mo", difficulty: "low", opportunity: "low" },
      { keyword: "project management for developers", volume: "5,400/mo", difficulty: "low", opportunity: "high" },
      { keyword: "best issue tracker for developers", volume: "3,800/mo", difficulty: "low", opportunity: "high" },
    ],
    seoScore: 62,
    seoRecommendation: "Weak in non-branded queries. Build content around 'best issue tracker for developers', 'Jira alternatives 2025', and workflow-specific tutorials.",
    paidCompetitionLevel: "medium",
    estimatedCPC: "$3.00–$8.00 for developer tool keywords",
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
        buyingTriggers: [
          "Team grows past 10 engineers — Jira becomes unmanageable",
          "New engineering manager joins and wants to modernize tooling",
          "Quarter-end velocity review reveals process bottlenecks",
        ],
        objections: [
          "Switching cost from Jira — years of data and established workflows",
          "Concern about feature parity for non-engineering stakeholders (PM, design)",
          "Small company — will Linear still be around in 5 years?",
        ],
        whereToFind: [
          "Dev Twitter (@linear, #buildinpublic, engineering manager threads)",
          "Hacker News (Jira frustration threads, tool recommendation posts)",
          "Engineering Slack communities (Rands Leadership, CTO Craft)",
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
        buyingTriggers: [
          "Product team doubles in size and needs better cross-team visibility",
          "CEO asks for a real-time roadmap view for board reporting",
          "Engineering team is already using Linear and PM needs to join",
        ],
        objections: [
          "Linear feels engineering-centric — missing PM-specific features",
          "No built-in customer feedback or feature request tracking",
          "Reporting capabilities are less mature than alternatives",
        ],
        whereToFind: [
          "LinkedIn (Product Manager groups, startup communities)",
          "Product Hunt (searching for roadmap and project tools)",
          "Twitter (product management discussions, #prodmgmt)",
        ],
        size: "small",
        priority: "secondary",
      },
    ],
    audienceChannels: [
      {
        platform: "Twitter/X",
        relevance: 92,
        tip: "Dev Twitter is where Linear's reputation was built. Continue engaging with developers, sharing product updates, and amplifying user praise.",
        category: "social",
        specificLinks: ["@linear", "Dev Twitter community", "#buildinpublic hashtag", "@karrisaarinen"],
        recommendedKeywords: ["Linear app", "fast issue tracker", "Jira alternative", "developer workflow"],
        bestFormats: ["Product update threads", "Speed comparison GIFs", "User testimonial retweets"],
        postingFrequency: "Daily",
      },
      {
        platform: "Hacker News",
        relevance: 88,
        tip: "Launch posts, changelogs, and opinionated product posts perform well. Authentic voice matters more than marketing polish here.",
        category: "community",
        specificLinks: ["Show HN: Linear launches", "HN: Ask – Project management tools", "HN: Who is hiring?"],
        recommendedKeywords: ["issue tracker", "Jira alternative", "project management speed", "developer tools"],
        bestFormats: ["Show HN launches", "Opinionated blog posts", "Technical architecture posts"],
        postingFrequency: "1–2x/week",
      },
      {
        platform: "Word of Mouth",
        relevance: 95,
        tip: "Developers recommend Linear to their peers. Amplify this with a referral program or 'invite your team' flow.",
        category: "community",
        specificLinks: ["linear.app/invite (team invites)", "Dev conference hallway conversations", "Engineering Slack communities"],
        recommendedKeywords: ["Linear recommendation", "best dev tool", "team productivity"],
        bestFormats: ["Team invite flows", "Referral incentives", "Conference sponsorships"],
        postingFrequency: "Always-on (product-driven)",
      },
      {
        platform: "GitHub",
        relevance: 72,
        tip: "Integrations and open-source tooling around Linear. Maintain active presence.",
        category: "community",
        specificLinks: ["github.com/linear", "Linear API documentation", "Linear GitHub integration"],
        recommendedKeywords: ["linear-api", "issue tracker integration", "GitHub Linear sync"],
        bestFormats: ["Integration repos", "SDK examples", "API documentation"],
        postingFrequency: "Weekly updates",
      },
      {
        platform: "YouTube",
        relevance: 45,
        tip: "Largely untapped. Developer workflow videos and 'Linear vs Jira' comparisons could capture high-intent search traffic.",
        category: "content",
        specificLinks: ["YouTube: Linear app (minimal presence)", "Dev workflow channels", "SaaS review channels"],
        recommendedKeywords: ["Linear vs Jira", "Linear tutorial", "sprint planning Linear", "issue tracking demo"],
        bestFormats: ["Workflow demo videos", "Comparison videos", "Sprint planning walkthroughs"],
        postingFrequency: "Bi-weekly (recommended, currently inactive)",
      },
      {
        platform: "Google Ads",
        relevance: 55,
        tip: "Test small budget on high-intent 'Jira alternative' keywords. Brand-driven growth may justify lower paid spend.",
        category: "paid",
        specificLinks: ["Google Ads Search Network"],
        recommendedKeywords: ["Jira alternative", "fast issue tracker", "project management for engineering teams"],
        bestFormats: ["Search ads"],
        postingFrequency: "Test campaign",
        budgetLevel: "medium",
        estimatedCPC: "$5–$8",
      },
      {
        platform: "Twitter/X Ads",
        relevance: 40,
        tip: "Target followers of competing tools and developer influencers.",
        category: "paid",
        specificLinks: ["Twitter Ads Manager"],
        recommendedKeywords: ["developer tools", "project management", "issue tracking"],
        bestFormats: ["Promoted tweets"],
        postingFrequency: "Test campaign",
        budgetLevel: "low",
        estimatedCPC: "$3–$5",
      },
    ],
    optimizations: [
      {
        area: "SEO Comparison Content",
        currentState: "No 'Linear vs Jira' or 'Linear vs Shortcut' pages exist",
        recommendation: "Create detailed comparison pages targeting developers actively searching for Jira alternatives. Include migration guides and feature tables.",
        priority: "high",
        impact: "high",
        effort: "3–5 days per page",
        expectedOutcome: "+40–60% organic traffic from comparison keywords within 3 months",
      },
      {
        area: "Video Content",
        currentState: "Minimal video presence on YouTube",
        recommendation: "Produce bi-weekly developer workflow videos: 'How we use Linear at [Company]', sprint planning demos, and keyboard shortcut deep-dives.",
        priority: "medium",
        impact: "high",
        effort: "Ongoing (1 video editor + 4h/week founder time)",
        expectedOutcome: "New acquisition channel reaching 5K–10K views/video within 6 months",
      },
      {
        area: "Enterprise Landing Page",
        currentState: "Enterprise tier exists but lacks dedicated positioning",
        recommendation: "Create an enterprise-focused page with SOC 2 compliance, SSO, audit logs, and customer logos from 100+ employee companies.",
        priority: "medium",
        impact: "medium",
        effort: "1 week (design + copy + compliance docs)",
        expectedOutcome: "+20–30% enterprise inbound inquiries from website",
      },
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
  sectionsCompleted: g.status === "completed" ? 6 : g.status === "analyzing" ? 4 : 0,
  totalSections: 6,
  status: g.status,
  createdAt: g.createdAt,
}));
