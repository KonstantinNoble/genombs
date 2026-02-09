import type { PerformanceScores } from "./demo-data";

export interface CompetitorProfile {
  name: string;
  domain: string;
  scores: PerformanceScores;
  strengths: string[];
  weaknesses: string[];
}

export interface KeywordGap {
  keyword: string;
  volume: string;
  competitorHas: string[];
  youHave: boolean;
}

export interface ChannelGap {
  channel: string;
  competitorUsing: string[];
  youUsing: boolean;
  recommendation: string;
}

export interface SWOTAnalysis {
  competitor: string;
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
}

export interface CompetitorAnalysis {
  id: string;
  yourDomain: string;
  yourName: string;
  yourScores: PerformanceScores;
  competitors: CompetitorProfile[];
  swotAnalyses: SWOTAnalysis[];
  keywordGaps: KeywordGap[];
  channelGaps: ChannelGap[];
  takeaways: string[];
  createdAt: string;
}

export const demoCompetitorAnalysis: CompetitorAnalysis = {
  id: "demo-competitor-stripe",
  yourDomain: "stripe.com",
  yourName: "Stripe",
  yourScores: { seo: 88, content: 72, social: 65, paid: 78, trust: 85, funnel: 90 },
  competitors: [
    {
      name: "PayPal",
      domain: "paypal.com",
      scores: { seo: 92, content: 80, social: 75, paid: 85, trust: 90, funnel: 78 },
      strengths: [
        "Massive brand recognition and consumer trust",
        "Strong SEO presence across all payment-related queries",
        "Established enterprise sales pipeline",
      ],
      weaknesses: [
        "Developer experience is significantly behind Stripe",
        "API documentation quality is mediocre",
        "Product innovation pace has slowed",
      ],
    },
    {
      name: "Square",
      domain: "squareup.com",
      scores: { seo: 70, content: 68, social: 80, paid: 72, trust: 82, funnel: 75 },
      strengths: [
        "Strong brand in SMB/retail segment",
        "Excellent social media presence and content marketing",
        "Hardware + software ecosystem creates lock-in",
      ],
      weaknesses: [
        "Limited enterprise appeal",
        "Weak international presence compared to Stripe",
        "Developer tools are basic compared to Stripe's API",
      ],
    },
    {
      name: "Adyen",
      domain: "adyen.com",
      scores: { seo: 60, content: 55, social: 40, paid: 65, trust: 88, funnel: 82 },
      strengths: [
        "Dominant in large enterprise segment",
        "Single-platform approach appeals to global companies",
        "Strong trust signals and compliance certifications",
      ],
      weaknesses: [
        "Almost no SMB/startup presence",
        "Minimal content marketing and social engagement",
        "SEO presence is weak for a company of its size",
      ],
    },
  ],
  swotAnalyses: [
    {
      competitor: "PayPal",
      strengths: ["Consumer brand trust", "Massive user base (400M+)", "Strong SEO dominance"],
      weaknesses: ["Poor developer experience", "Slow product innovation", "Complex pricing structure"],
      opportunities: ["PayPal's developer frustration creates switching opportunity", "Enterprise buyers moving away from PayPal's legacy systems"],
      threats: ["PayPal's brand makes them default choice for non-technical buyers", "PayPal Braintree competes directly in developer segment"],
    },
    {
      competitor: "Square",
      strengths: ["SMB brand loyalty", "Hardware ecosystem", "Strong social content"],
      weaknesses: ["Limited enterprise capabilities", "Weak international coverage", "Basic developer tools"],
      opportunities: ["Square users outgrowing the platform need enterprise features", "International expansion gap leaves market open"],
      threats: ["Square's Cash App creates consumer-side network effects", "Square's acquisition strategy may close feature gaps"],
    },
    {
      competitor: "Adyen",
      strengths: ["Enterprise trust and compliance", "Single-platform simplicity", "Global payment coverage"],
      weaknesses: ["No SMB market presence", "Minimal content/SEO effort", "No self-serve onboarding"],
      opportunities: ["Adyen's lack of self-serve means mid-market is underserved", "Content marketing vacuum — Adyen barely publishes"],
      threats: ["Adyen's enterprise relationships are deeply entrenched", "Adyen's unified platform appeals to consolidation-minded CTOs"],
    },
  ],
  keywordGaps: [
    { keyword: "buy now pay later API", volume: "4,200/mo", competitorHas: ["PayPal", "Square"], youHave: false },
    { keyword: "point of sale system", volume: "22,000/mo", competitorHas: ["Square"], youHave: false },
    { keyword: "business debit card", volume: "9,800/mo", competitorHas: ["PayPal", "Square"], youHave: false },
    { keyword: "unified commerce platform", volume: "2,100/mo", competitorHas: ["Adyen"], youHave: false },
    { keyword: "payment orchestration", volume: "3,500/mo", competitorHas: ["Adyen"], youHave: false },
    { keyword: "invoice payments", volume: "6,200/mo", competitorHas: ["PayPal", "Square"], youHave: true },
  ],
  channelGaps: [
    { channel: "YouTube", competitorUsing: ["PayPal", "Square"], youUsing: false, recommendation: "Create product tutorials and integration walkthroughs — Square's YouTube content drives significant SMB signups." },
    { channel: "TikTok", competitorUsing: ["Square"], youUsing: false, recommendation: "Square's TikTok presence targets small business owners. Consider short-form content for startup founders." },
    { channel: "Podcast Sponsorships", competitorUsing: ["PayPal", "Adyen"], youUsing: false, recommendation: "Sponsor developer and fintech podcasts to reach technical decision-makers in a trusted context." },
    { channel: "Reddit", competitorUsing: ["PayPal", "Square"], youUsing: true, recommendation: "Already present but could increase engagement in r/startups, r/SaaS, and r/webdev." },
  ],
  takeaways: [
    "Create comparison landing pages ('Stripe vs PayPal', 'Stripe vs Square') to capture high-intent search traffic that currently goes to competitor content.",
    "Launch a YouTube channel with integration tutorials — Square's video content drives measurable SMB acquisition that Stripe is missing entirely.",
    "Target the 'payment orchestration' keyword cluster that Adyen dominates — this is a growing enterprise search term with low competition from other players.",
    "Exploit PayPal's developer experience weakness by creating migration guides and 'switching from PayPal' content targeting frustrated developers.",
    "Consider podcast sponsorships on developer-focused shows (Changelog, Software Engineering Daily) — this channel is underutilized by all competitors.",
  ],
  createdAt: "2025-01-20T14:00:00Z",
};
