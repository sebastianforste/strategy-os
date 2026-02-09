import { LucideIcon, Briefcase, Building2, Wallet, Users, Megaphone, Globe } from "lucide-react";

export interface Sector {
  id: string;
  name: string;
  iconName: "Briefcase" | "Building2" | "Wallet" | "Users" | "Megaphone" | "Globe";
  contextPrompt: string;
  jargon: string[];
  antiPatterns: string[];
}

export const SECTORS: Record<string, Sector> = {
  general: {
    id: "general",
    name: "General / Agnostic",
    iconName: "Globe",
    contextPrompt: `
      CONTEXT: You are writing for a general business audience.
      FOCUS: Universal principles of strategy, leadership, and execution.
      GOAL: Broad appeal without being generic. Use analogies that work across industries.
    `,
    jargon: ["Strategy", "Execution", "Leverage", "Scale", "Moat"],
    antiPatterns: ["Niche acronyms without explanation", "Hyper-specific industry examples"]
  },
  saas: {
    id: "saas",
    name: "B2B SaaS",
    iconName: "Briefcase",
    contextPrompt: `
      CONTEXT: You are a B2B SaaS Operator/Founder.
      AUDIENCE: Founders, VCs, Product Leaders, CROs.
      FOCUS: Recurring revenue, capital efficiency, product-led growth (PLG), enterprise sales.
      REALITY: The market is crowded. Efficiency > Growth at all costs. Retention is king.
    `,
    jargon: ["ARR", "NRR", "CAC", "LTV", "Churn", "PLG", "ACV", "Burn Multiple", "Feature Factory"],
    antiPatterns: ["Manufacturing metaphors", "Retail examples", "confusing 'revenue' with 'bookings'"]
  },
  real_estate: {
    id: "real_estate",
    name: "Real Estate",
    iconName: "Building2",
    contextPrompt: `
      CONTEXT: You are a Real Estate Investor/Developer.
      AUDIENCE: LPs, Brokers, Syndicators, High Net Worth Individuals.
      FOCUS: Cash flow, appreciation, leverage, tax benefits, asset management.
      REALITY: Rates are high. Deals are harder to pencil. Operations matter more than ever.
    `,
    jargon: ["Cap Rate", "NOI", "IRR", "Cash-on-Cash", "LTV", "DSCR", "GP/LP", "Syndication", "Value-Add"],
    antiPatterns: ["Tech startup jargon (don't say 'MVP')", "Ignoring debt/leverage nuances"]
  },
  fintech: {
    id: "fintech",
    name: "FinTech",
    iconName: "Wallet",
    contextPrompt: `
      CONTEXT: You are a FinTech Innovator.
      AUDIENCE: Bankers, Regulators, Investors, Founders.
      FOCUS: Trust, compliance, embedded finance, payment flows, unbundling banking.
      REALITY: 'Growth hacking' is illegal here. Trust is the currency. Unit economics must work.
    `,
    jargon: ["Interchange", "KYC/AML", "Liquidity", "Basis Points (Bps)", "Ledger", "Custody", "Embedded Finance"],
    antiPatterns: ["Move fast and break things (implies compliance failure)", "Crypto bro slang (unless specific to crypto)"]
  },
  agency: {
    id: "agency",
    name: "Agency / Consulting",
    iconName: "Users",
    contextPrompt: `
      CONTEXT: You run a High-Ticket Service Business (Agency/Consultancy).
      AUDIENCE: Clients, other agency owners, freelancers.
      FOCUS: Client acquisition, fulfillment, margins, hiring, productizing services.
      REALITY: Trading time for money is a trap. You want to sell outcomes, not hours.
    `,
    jargon: ["Retainer", "Scope Creep", "Deliverables", "SOPs", "Utilization Rate", "Productized Service", "Discovery Call"],
    antiPatterns: ["VC metrics (don't track ARR, track MRR/Cash)", "Talking about 'exits' (most agencies don't exit)"]
  },
  creator: {
    id: "creator",
    name: "Creator Economy",
    iconName: "Megaphone",
    contextPrompt: `
      CONTEXT: You are a Professional Creator / Solopreneur.
      AUDIENCE: Aspiring creators, fans, brands.
      FOCUS: Audience growth, monetization, newsletters, digital products, authenticity.
      REALITY: Algorithms are volatile. You need to own your audience (email list). Burnout is real.
    `,
    jargon: ["Engagement Rate", "Impressions", "Funnel", "Lead Magnet", "Algorithm", "Para-social", "Offer"],
    antiPatterns: ["Corporate speak", "Hiding behind a brand logo", "Being boring"]
  }
};

export type SectorId = keyof typeof SECTORS;
