export interface WebsiteProfile {
  id: string;
  url: string;
  isOwnWebsite: boolean;
  overallScore: number;
  categoryScores: {
    findability: number;
    mobileUsability: number;
    offerClarity: number;
    trustProof: number;
    conversionReadiness: number;
  };
  profileData: {
    name: string;
    targetAudience: string;
    usp: string;
    ctas: string[];
    siteStructure: string[];
    strengths: string[];
    weaknesses: string[];
  };
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
}

export interface ChatConversation {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: string;
}

export interface ImprovementTask {
  id: string;
  websiteProfileId: string;
  title: string;
  description: string;
  category: string;
  status: "todo" | "in_progress" | "done";
  priority: "low" | "medium" | "high";
  createdAt: string;
}

export const mockWebsiteProfiles: WebsiteProfile[] = [
  {
    id: "wp-1",
    url: "https://my-craft.com",
    isOwnWebsite: true,
    overallScore: 68,
    categoryScores: { findability: 55, mobileUsability: 62, offerClarity: 70, trustProof: 82, conversionReadiness: 45 },
    profileData: {
      name: "My Craft",
      targetAudience: "Homeowners and tenants in Munich area, 30–60, mid to high income.",
      usp: "Master craftsmen with 20 years of experience, free initial consultation, fixed-price guarantee.",
      ctas: ["Request a Quote", "Book Free Consultation"],
      siteStructure: ["Home", "Services", "About", "References", "Contact"],
      strengths: [
        "Clear regional positioning",
        "Trust signals: reviews, certifications",
        "Fixed-price guarantee differentiator",
      ],
      weaknesses: [
        "No online booking system",
        "No case studies or before/after visuals",
        "Slow and cluttered mobile experience",
      ],
    },
    createdAt: "2026-02-08T10:00:00Z",
  },
  {
    id: "wp-2",
    url: "https://quick-repair.com",
    isOwnWebsite: false,
    overallScore: 74,
    categoryScores: { findability: 70, mobileUsability: 80, offerClarity: 60, trustProof: 72, conversionReadiness: 78 },
    profileData: {
      name: "Quick Repair",
      targetAudience: "Customers with urgent repair needs. Broad age range, local focus.",
      usp: "24/7 emergency service, 30-minute arrival, transparent pricing.",
      ctas: ["Call Emergency", "WhatsApp Contact"],
      siteStructure: ["Home", "Emergency", "Pricing", "Reviews", "Contact"],
      strengths: [
        "Strong emergency positioning",
        "WhatsApp integration for fast contact",
        "Prominent Google reviews",
      ],
      weaknesses: [
        "No planned renovation services",
        "Unprofessional design with too many colors",
        "No certifications visible",
      ],
    },
    createdAt: "2026-02-08T10:30:00Z",
  },
  {
    id: "wp-3",
    url: "https://builder-mueller.com",
    isOwnWebsite: false,
    overallScore: 81,
    categoryScores: { findability: 78, mobileUsability: 85, offerClarity: 88, trustProof: 80, conversionReadiness: 55 },
    profileData: {
      name: "Builder Mueller",
      targetAudience: "Builders and architects for new construction and major renovations.",
      usp: "Full service from planning to completion, BIM planning, energy-efficient building.",
      ctas: ["Request Project", "View References"],
      siteStructure: ["Home", "Services", "Projects", "Team", "Sustainability", "Contact"],
      strengths: [
        "Professional web presence",
        "Impressive project gallery",
        "Sustainability positioning",
      ],
      weaknesses: [
        "Slow load times from large images",
        "No price transparency",
        "Contact form too complex",
      ],
    },
    createdAt: "2026-02-09T14:00:00Z",
  },
];

export const mockConversations: ChatConversation[] = [
  {
    id: "conv-1",
    title: "Website Analysis: My Craft",
    createdAt: "2026-02-08T10:00:00Z",
    messages: [
      {
        id: "msg-1",
        role: "user",
        content: "Analyze my website https://my-craft.com",
        createdAt: "2026-02-08T10:00:00Z",
      },
      {
        id: "msg-2",
        role: "assistant",
        content: `I've analyzed **my-craft.com** and created a structured profile.

## Summary

**Target Audience:** Homeowners and tenants in the Munich area (30–60 years), needing renovation or repair work.

**Value Proposition:** Master craftsmen with 20 years of experience, free initial consultation, fixed-price guarantee.

## Strengths
- Clear positioning as a regional master craftsman business
- Trust elements like reviews and certifications
- Fixed-price guarantee as a differentiator

## Weaknesses
- **No online booking** — customers must call
- **No case studies** or before/after visuals
- **Mobile version** slow and cluttered
- **No content marketing** (blog/guides)

Should I create an improvement plan or compare with a competitor?`,
        createdAt: "2026-02-08T10:01:00Z",
      },
      {
        id: "msg-3",
        role: "user",
        content: "Compare me with https://quick-repair.com — what do they do better?",
        createdAt: "2026-02-08T10:05:00Z",
      },
      {
        id: "msg-4",
        role: "assistant",
        content: `I've analyzed **quick-repair.com**. Here's the comparison:

## What Quick Repair Does Better

| Criterion | My Craft | Quick Repair |
|-----------|----------|--------------|
| Contact | Phone & form only | **WhatsApp + Phone** |
| Availability | Business hours | **24/7 emergency** |
| Reviews | Present but hidden | **Prominent on homepage** |
| Response time | Not communicated | **"30 min arrival" promised** |

## What You Do Better

- **Fixed-price guarantee** — Quick Repair has no price guarantee
- **Master certification** visible — competitor lacks certifications
- **Broader offering** — not just emergencies, also renovation

## Recommendation
Adopt **WhatsApp integration** and make your **reviews more prominent**. Your fixed-price guarantee is a strong differentiator — highlight it even more.`,
        createdAt: "2026-02-08T10:06:00Z",
      },
    ],
  },
  {
    id: "conv-2",
    title: "Mobile Improvement Plan",
    createdAt: "2026-02-09T14:00:00Z",
    messages: [
      {
        id: "msg-5",
        role: "user",
        content: "Create a concrete plan to improve my mobile website.",
        createdAt: "2026-02-09T14:00:00Z",
      },
      {
        id: "msg-6",
        role: "assistant",
        content: `Here's your **Mobile Optimization Plan** based on the analysis of my-craft.com:

## Phase 1: Quick Wins (this week)
1. **Compress images** — Current images are uncompressed (3-5 MB). Target: under 200 KB per image
2. **Click-to-call button** — Large, visible phone button in header
3. **Simplify menu** — Max 5 main items in mobile menu

## Phase 2: Structural Improvements (next 2 weeks)
4. **Online booking** integration (e.g. Calendly or custom form)
5. **WhatsApp button** as floating action button
6. **Reviews** embedded directly on homepage

## Phase 3: Content (ongoing)
7. **Before/after gallery** for completed projects
8. **Guide blog** to start (SEO + trust building)

Should I create tasks for your planner?`,
        createdAt: "2026-02-09T14:01:00Z",
      },
    ],
  },
];

export const mockTasks: ImprovementTask[] = [
  {
    id: "task-1",
    websiteProfileId: "wp-1",
    title: "Compress images",
    description: "Compress all website images to under 200 KB. Tools: TinyPNG, Squoosh.",
    category: "Conversion Readiness",
    status: "done",
    priority: "high",
    createdAt: "2026-02-09T14:02:00Z",
  },
  {
    id: "task-2",
    websiteProfileId: "wp-1",
    title: "Add click-to-call button",
    description: "Place a large, visible phone button in the mobile header.",
    category: "Mobile Usability",
    status: "in_progress",
    priority: "high",
    createdAt: "2026-02-09T14:02:00Z",
  },
  {
    id: "task-3",
    websiteProfileId: "wp-1",
    title: "Integrate WhatsApp button",
    description: "Add floating WhatsApp button on all pages for quick contact.",
    category: "Mobile Usability",
    status: "todo",
    priority: "medium",
    createdAt: "2026-02-09T14:02:00Z",
  },
  {
    id: "task-4",
    websiteProfileId: "wp-1",
    title: "Set up online booking",
    description: "Integrate Calendly or custom booking form.",
    category: "Conversion Readiness",
    status: "todo",
    priority: "medium",
    createdAt: "2026-02-09T14:02:00Z",
  },
  {
    id: "task-5",
    websiteProfileId: "wp-1",
    title: "Create before/after gallery",
    description: "Build image gallery with completed project references.",
    category: "Content",
    status: "todo",
    priority: "low",
    createdAt: "2026-02-09T14:02:00Z",
  },
];
