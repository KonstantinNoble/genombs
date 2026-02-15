

## Website Visual and Text Polish

The current site is already clean and minimal, which is good. The goal is to refine it so it feels more **hand-crafted and editorial** rather than template-generated, while keeping the no-emoji, no-icon, no-gradient rule.

---

### Text Improvements

The biggest "AI-generated" tell is the generic marketing language. Here are the specific text rewrites:

**Home.tsx - Hero:**
- Current: "Turn your website into a growth engine"
- New: "Know exactly what's holding your website back"
- Current subtitle: "One URL. One scan. AI-powered website scoring, competitor analysis, and an improvement plan -- in under 60 seconds."
- New: "Paste a URL. Get a structured analysis across findability, usability, clarity, trust, and conversion -- with competitor benchmarks and a prioritized fix list."
- Current tagline: "Business Growth Platform"
- New: "Website Analysis Platform"

**Home.tsx - Features section:**
- Current heading: "Everything you need to grow"
- New: "What you get"
- Current subheading: "One scan. Five scoring categories. Actionable results."
- New: "A structured breakdown of what works, what doesn't, and what to fix first."
- Rewrite feature descriptions to be shorter, more direct, less salesy

**Home.tsx - Use Cases section:**
- Current heading: "Built for every growth workflow"
- New: "Use cases"
- Current subheading: "Whether you're launching, scaling, or optimizing -- Business Genome has you covered."
- New: Remove entirely or replace with a single factual line

**Home.tsx - How it works:**
- Current heading subtext: "From URL to actionable insights in under 60 seconds."
- New: "Three steps. No setup required."

**Home.tsx - Comparison table:**
- Current heading: "Business Genome vs. Consultant"
- New: "Compared to traditional consulting"
- Remove "Replace hours of manual research with structured, AI-powered analysis." (too salesy)

**Home.tsx - CTA:**
- Current: "Ready to grow your business?"
- New: "Try it now" or simply "Get started"
- Remove "20 free credits per day. No credit card required." from CTA (already stated in hero)

**Home.tsx - Stats section:**
- Remove the checkmark symbol from "PageSpeed Included" -- replace with "Incl." or just the text without a symbol

**Pricing.tsx:**
- Texts are already clean, minor polish only
- "Get started at no cost" --> "No account fees"
- "Full access to everything" --> "All features, higher limits"

**Contact.tsx:**
- Remove the Mail icon (per no-icons rule for marketing surfaces)
- Make the layout simpler -- just heading, email, response time. No card wrapper needed.

**Profile.tsx:**
- Remove emoji-like symbols: checkmark, warning triangle, info circle in Premium Status section
- Replace with text: "Active", "Canceled", "Pending"

---

### Visual Improvements

**Home.tsx - Layout refinements:**
- Reduce vertical padding from py-24/py-32 to py-16/py-20 on some sections to feel less "template spacey"
- Use Cases section: remove the alternating flex-row-reverse pattern (feels like a template trick)
- Features section: reduce the oversized decorative numbers (text-6xl) to text-4xl -- they dominate too much
- Stats section: the checkmark symbol looks unprofessional, replace with text

**Contact.tsx:**
- Remove the icon circle (w-16 h-16 rounded-full bg-primary/10 with Mail icon)
- Simplify to just text: heading, email link, response time

**Profile.tsx:**
- Replace unicode symbols with plain text labels for premium status

**Footer.tsx:**
- The footer "Business" column only has one link ("Business Inquiries") -- add Pricing link to give it balance, or merge into a single column

**Navbar.tsx:**
- Already clean, no changes needed

---

### Files to modify

1. **src/pages/Home.tsx** -- Text rewrites (hero, features, use cases, how it works, comparison, CTA, stats), reduce padding, smaller decorative numbers, remove checkmark from stats
2. **src/pages/Contact.tsx** -- Remove Mail icon and card, simplify layout
3. **src/pages/Profile.tsx** -- Replace emoji symbols with text
4. **src/pages/Pricing.tsx** -- Minor text polish (2 lines)
5. **src/components/Footer.tsx** -- Add Pricing link to Business column for balance

### What stays unchanged
- Color scheme (black/orange) -- already strong
- Navbar -- already clean
- Chat page -- functional interface, not a marketing surface
- CSS/design system -- no structural changes needed
- Auth page -- already professional

