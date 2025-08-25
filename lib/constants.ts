export const TEMPLATES = [
  { key: 'auto', name: 'Auto-Select Best Match' },
  { key: 'tpl-1', name: 'Classic - Professional' },
  { key: 'tpl-2', name: 'Modern - Minimalist' },
  { key: 'tpl-3', name: 'Bold - Dynamic' },
  { key: 'tpl-4', name: 'Friendly - Approachable' },
  { key: 'tpl-5', name: 'Premium - Sophisticated' }
];

export const TONES = [
  { key: 'corporate', name: 'Corporate' },
  { key: 'neutral', name: 'Neutral' },
  { key: 'friendly', name: 'Friendly' }
];

export const LANGUAGES = [
  { key: 'auto', name: 'Auto-detect' },
  { key: 'en', name: 'English' },
  { key: 'es', name: 'Spanish' },
  { key: 'pt', name: 'Portuguese' }
];

export const COUNTRIES = [
  'Mexico', 'Philippines', 'India', 'Nigeria', 'Guatemala', 'El Salvador',
  'Honduras', 'Dominican Republic', 'Jamaica', 'Haiti', 'Colombia', 'Ecuador',
  'Peru', 'Brazil', 'Vietnam', 'Bangladesh', 'Pakistan', 'Ghana', 'Kenya', 'Uganda'
];

export const DEFAULT_SECTIONS = {
  hero: {
    headline: "Send Money Home Safely, Quickly, and Affordably with {Bank}",
    subheadline: "Instant transfers from the U.S. to {Country} with {Bank}. Lower fees, better rates, faster delivery.",
    countries: COUNTRIES,
    primaryCtaText: "Start Sending Money",
    primaryCtaHref: "/signup",
    visual: { overlayMockUrl: "", imageUrl: "https://images.pexels.com/photos/7414284/pexels-photo-7414284.jpeg" }
  },
  howItWorks: {
    headline: "Fast. Simple. Secure.",
    steps: [
      { title: "Enter amount & recipient", body: "Choose how much to send and where." },
      { title: "Pay with debit card or cash", body: "Low, transparent fees shown upfront." },
      { title: "Funds arrive instantly", body: "Direct to recipient's account or wallet." }
    ],
    copy: "No hidden charges, no surprises. Just fast, secure money transfers at the best rates."
  },
  pricing: {
    headline: "Know Exactly What You Pay",
    copy: "Transparent pricing with no hidden fees. See exactly how much you'll pay and how much your recipient gets before you send.",
    ctaText: "Try Fee Calculator",
    ctaHref: "/calculator"
  },
  why: {
    headline: "Why Families Trust {Bank}",
    bullets: [
      { title: "Licensed & Regulated", body: "Fully compliant with all federal and state regulations" },
      { title: "Bank-Level Security", body: "Your money and data are protected with enterprise-grade security" },
      { title: "24/7 Support", body: "Get help when you need it, in your language" }
    ],
    trustBadges: [
      { name: "FDIC", logoUrl: "" },
      { name: "BBB A+", logoUrl: "" },
      { name: "SSL Secure", logoUrl: "" }
    ]
  },
  stories: {
    headline: "Stories from Families Like Yours",
    testimonials: [
      { quote: "I've been sending money to my family for 3 years. The rates are great and it's so easy to use.", name: "Maria S.", location: "Los Angeles, CA" },
      { quote: "Finally, a service that doesn't charge crazy fees. My family gets more money, and I pay less.", name: "Carlos R.", location: "Houston, TX" }
    ],
    images: []
  },
  compliance: {
    headline: "Your Security is Our Priority",
    copy: "We follow strict federal and state regulations to keep your money safe. Licensed in all 50 states with full compliance oversight.",
    badges: [
      { name: "Money Service Business", logoUrl: "" },
      { name: "FinCEN Registered", logoUrl: "" },
      { name: "State Licensed", logoUrl: "" }
    ],
    linkText: "Learn about our compliance",
    linkHref: "/compliance"
  },
  compare: {
    subcopy: "See how {Bank} stacks up against other services",
    disclaimer: "Comparisons are indicative and may vary based on amount, destination, and current rates. Fees and exchange rates shown are examples.",
    microcopyByCompetitor: {
      wise: { tooltip: "Rates as of last update", sources: [{ label: "Wise Pricing", href: "https://wise.com/pricing" }] },
      remitly: { tooltip: "Based on published rates", sources: [{ label: "Remitly Fees", href: "https://remitly.com/fees" }] },
      westernUnion: { tooltip: "Standard pricing", sources: [{ label: "WU Pricing", href: "https://westernunion.com/pricing" }] }
    }
  },
  finalCta: {
    headline: "Ready to Send Money Home Today?",
    ctaText: "Start Sending Now",
    ctaHref: "/onboard",
    subcopy: "Sign up in minutes. Your first transfer fee is on us."
  },
  footer: {
    links: [
      { label: "About Us", href: "/about" },
      { label: "Security & Compliance", href: "/compliance" },
      { label: "FAQs", href: "/faqs" },
      { label: "Support", href: "/support" },
      { label: "Terms & Conditions", href: "/terms" },
      { label: "Privacy Policy", href: "/privacy" }
    ]
  }
};