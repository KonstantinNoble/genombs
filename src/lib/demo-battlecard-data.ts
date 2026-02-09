export interface BattleCard {
  competitor: string;
  domain: string;
  howWeWin: string[];
  theirPitch: string[];
  counterArguments: string[];
  triggerPhrases: string[];
  whenWeLose: string[];
}

export const demoBattleCards: BattleCard[] = [
  {
    competitor: "PayPal",
    domain: "paypal.com",
    howWeWin: [
      "Developer experience is significantly superior — our API documentation, SDKs, and developer tools are industry-leading, reducing integration time by 60%.",
      "Modern, composable architecture allows businesses to customize every part of their payment stack, while PayPal offers rigid, one-size-fits-all solutions.",
      "Transparent, predictable pricing without hidden fees — PayPal's pricing structure is notoriously complex with currency conversion markups and cross-border surcharges.",
      "Faster innovation cycle: we ship new features monthly while PayPal's legacy infrastructure slows their product development.",
    ],
    theirPitch: [
      "\"400 million active accounts trust PayPal\" — they lead with brand recognition and consumer familiarity as their primary selling point.",
      "\"One integration, access to PayPal, Venmo, and Pay Later\" — they bundle their consumer products to create perceived value.",
      "\"Enterprise-grade fraud protection\" — they position Braintree as a developer-friendly alternative within the PayPal ecosystem.",
    ],
    counterArguments: [
      "When they say \"400M users trust us\": Respond with \"Consumer trust doesn't equal merchant satisfaction. Our merchant NPS is 2x higher because we optimize for the business, not just the buyer.\"",
      "When they say \"Braintree is developer-friendly\": Respond with \"Braintree was acquired in 2013 and still runs on legacy architecture. Compare our API docs side-by-side — the difference in developer experience is immediately obvious.\"",
      "When they say \"All-in-one solution\": Respond with \"All-in-one often means compromise everywhere. Our modular approach lets you use best-in-class components for each part of your payment stack.\"",
    ],
    triggerPhrases: [
      "\"Unlike PayPal, we don't force your customers through a redirect — our embedded checkout keeps users on your site, which typically improves conversion rates by 10-15%.\"",
      "\"Our API was built for developers first. Your engineering team will save weeks of integration time, and our documentation is consistently rated the best in fintech.\"",
      "\"With us, you get transparent per-transaction pricing. No hidden currency conversion fees, no surprise holds on your funds.\"",
    ],
    whenWeLose: [
      "When the buyer is a non-technical SMB owner who already uses PayPal for personal transactions and wants the simplest possible setup with zero code.",
      "When the deal requires PayPal/Venmo as a payment method anyway — in that case, PayPal's bundled offering has a natural advantage.",
    ],
  },
  {
    competitor: "Square",
    domain: "squareup.com",
    howWeWin: [
      "Pure online-first architecture — our platform was built for internet commerce, while Square retrofitted their POS system for e-commerce.",
      "Enterprise scalability: we process payments for companies from startup to Fortune 500, while Square's infrastructure is optimized for SMB volume.",
      "Global coverage across 135+ countries and 45+ currencies — Square operates in only 6 countries.",
      "Advanced developer tools including webhooks, custom payment flows, and marketplace/platform capabilities that Square simply doesn't offer.",
    ],
    theirPitch: [
      "\"Hardware + software ecosystem\" — Square sells the convenience of unified in-person and online payments through a single provider.",
      "\"Built for small business\" — they position themselves as the champion of local businesses and entrepreneurs.",
      "\"Free online store included\" — they bundle e-commerce basics to reduce perceived cost for new merchants.",
    ],
    counterArguments: [
      "When they say \"unified POS + online\": Respond with \"If online revenue is your growth driver, you need a platform built for internet-scale commerce, not one that added e-commerce as an afterthought.\"",
      "When they say \"built for small business\": Respond with \"We serve businesses at every stage. Start with our simple integration, and scale to millions in volume without ever needing to migrate platforms.\"",
      "When they say \"free online store\": Respond with \"A free storefront with limited customization and basic features. Our integrations with Shopify, WooCommerce, and custom solutions give you complete control over your customer experience.\"",
    ],
    triggerPhrases: [
      "\"Square is excellent for coffee shops and retail stores. But if your growth is online, you need infrastructure built for the internet — that's what we do.\"",
      "\"Our platform scales from your first transaction to billions in annual volume. With Square, you'll hit limitations and need to migrate — that's expensive and risky.\"",
      "\"We operate in 135+ countries. If international expansion is on your roadmap, Square's 6-country coverage will become a bottleneck.\"",
    ],
    whenWeLose: [
      "When the business is primarily brick-and-mortar and needs POS hardware — Square's integrated hardware ecosystem is genuinely superior for in-person retail.",
      "When the buyer wants a single vendor for POS + online + payroll + banking and values simplicity over specialization.",
    ],
  },
  {
    competitor: "Adyen",
    domain: "adyen.com",
    howWeWin: [
      "Self-serve onboarding: businesses can start accepting payments in minutes, while Adyen requires sales conversations and manual setup taking weeks.",
      "Transparent, accessible pricing published on our website — Adyen provides custom quotes only, creating uncertainty for mid-market buyers.",
      "Superior developer documentation and community: 10x more code examples, tutorials, and open-source libraries than Adyen offers.",
      "Stronger SMB and mid-market product fit — Adyen's minimum volume requirements exclude most growing businesses.",
    ],
    theirPitch: [
      "\"Single platform for all payments globally\" — Adyen positions their unified architecture as reducing complexity for enterprise operations.",
      "\"Direct acquiring relationships\" — they highlight their acquiring licenses as a cost and control advantage.",
      "\"Trusted by the world's largest brands\" — they lead with logos like Uber, Spotify, and McDonald's to signal enterprise credibility.",
    ],
    counterArguments: [
      "When they say \"single platform\": Respond with \"A single platform is great until you need flexibility. Our modular approach lets you swap components, add providers, and customize without being locked into one vendor's roadmap.\"",
      "When they say \"direct acquiring\": Respond with \"Direct acquiring matters at massive scale. For businesses under $100M in volume, the cost difference is negligible, but the developer experience difference is enormous.\"",
      "When they say \"trusted by Uber and Spotify\": Respond with \"We also power payments for companies like Amazon, Google, and Shopify. The difference is we also serve the next Uber — companies at every stage of growth.\"",
    ],
    triggerPhrases: [
      "\"Adyen is built for enterprises with dedicated payment teams. If you want your developers to move fast without waiting for an account manager, our self-serve platform is the answer.\"",
      "\"We publish our pricing transparently. With Adyen, you won't know your costs until after the sales process — and volume commitments can lock you in.\"",
      "\"Our documentation and developer community are unmatched. Your team can find answers in minutes, not days waiting for Adyen support tickets.\"",
    ],
    whenWeLose: [
      "When the buyer is a large enterprise ($500M+ volume) that wants a single acquiring relationship across 30+ countries and has a dedicated payment operations team to manage the Adyen integration.",
      "When the decision is driven by a CFO focused purely on interchange optimization at massive scale — Adyen's direct acquiring can provide marginal cost advantages.",
    ],
  },
];
