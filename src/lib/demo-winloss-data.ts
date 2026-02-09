export interface Deal {
  id: string;
  name: string;
  outcome: "won" | "lost";
  competitor: string;
  value?: number;
  reason: string;
  notes?: string;
  date: string;
}

export const winReasonOptions = [
  "Better product fit",
  "Price advantage",
  "Stronger relationship",
  "Technical superiority",
  "Better support",
  "Other",
];

export const lossReasonOptions = [
  "Price too high",
  "Missing feature",
  "Competitor relationship",
  "Slow sales process",
  "Technical limitations",
  "Other",
];

export const demoDeals: Deal[] = [
  { id: "d1", name: "Acme Corp Integration", outcome: "won", competitor: "PayPal", value: 120000, reason: "Technical superiority", notes: "CTO was impressed by API docs quality.", date: "2025-01-15" },
  { id: "d2", name: "RetailHub Migration", outcome: "lost", competitor: "Square", value: 45000, reason: "Missing feature", notes: "Needed integrated POS hardware.", date: "2025-01-12" },
  { id: "d3", name: "CloudServe Payments", outcome: "won", competitor: "Adyen", value: 250000, reason: "Better product fit", notes: "Self-serve onboarding was the deciding factor.", date: "2025-01-08" },
  { id: "d4", name: "DataFlow Inc", outcome: "won", competitor: "PayPal", value: 80000, reason: "Price advantage", date: "2024-12-20" },
  { id: "d5", name: "ShopEasy Platform", outcome: "lost", competitor: "PayPal", value: 65000, reason: "Competitor relationship", notes: "Long-standing PayPal partnership.", date: "2024-12-15" },
  { id: "d6", name: "FinanceFirst", outcome: "won", competitor: "Adyen", value: 180000, reason: "Technical superiority", notes: "Developer team loved our SDK.", date: "2024-12-10" },
  { id: "d7", name: "GreenMart Online", outcome: "lost", competitor: "Square", value: 30000, reason: "Price too high", notes: "Small business, Square's free tier won.", date: "2024-12-05" },
  { id: "d8", name: "TechScale SaaS", outcome: "won", competitor: "PayPal", value: 95000, reason: "Better product fit", date: "2024-11-28" },
  { id: "d9", name: "MediaPro Agency", outcome: "won", competitor: "Square", value: 55000, reason: "Technical superiority", notes: "Needed marketplace payment splits.", date: "2024-11-22" },
  { id: "d10", name: "GlobalTrade Corp", outcome: "lost", competitor: "Adyen", value: 500000, reason: "Competitor relationship", notes: "Adyen's enterprise team had existing relationship.", date: "2024-11-18" },
  { id: "d11", name: "StartupXYZ", outcome: "won", competitor: "PayPal", value: 25000, reason: "Better support", date: "2024-11-10" },
  { id: "d12", name: "FoodChain Delivery", outcome: "lost", competitor: "Square", value: 40000, reason: "Missing feature", notes: "In-person + online combo requirement.", date: "2024-11-05" },
  { id: "d13", name: "LuxBrand Retail", outcome: "won", competitor: "Adyen", value: 300000, reason: "Price advantage", notes: "Adyen's custom pricing was 15% higher.", date: "2024-10-28" },
  { id: "d14", name: "EduPlatform", outcome: "won", competitor: "PayPal", value: 70000, reason: "Technical superiority", date: "2024-10-20" },
  { id: "d15", name: "HealthTech Solutions", outcome: "lost", competitor: "Adyen", value: 420000, reason: "Slow sales process", notes: "Adyen closed faster with dedicated team.", date: "2024-10-15" },
  { id: "d16", name: "TravelBook App", outcome: "won", competitor: "Square", value: 110000, reason: "Better product fit", notes: "International coverage was key.", date: "2024-09-30" },
  { id: "d17", name: "AutoParts Direct", outcome: "lost", competitor: "PayPal", value: 35000, reason: "Price too high", date: "2024-09-22" },
  { id: "d18", name: "SocialCommerce Co", outcome: "won", competitor: "PayPal", value: 150000, reason: "Stronger relationship", notes: "Our account team built trust over months.", date: "2024-09-15" },
];
