import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";

import { authOptions } from "@/utils/auth";
import { prisma } from "@/utils/db";
import { getStoredApiKeys } from "@/utils/server-api-keys";

export async function GET() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id || null;

  const stored = await getStoredApiKeys();
  const hasGeminiKey = Boolean((stored?.gemini || "").trim());
  const hasSerperKey = Boolean((stored?.serper || "").trim());

  const connectedProviders = userId
    ? await prisma.account
        .findMany({
          where: { userId },
          select: { provider: true },
        })
        .then((accounts) => ({
          linkedin: accounts.some((a) => a.provider === "linkedin"),
          twitter: accounts.some((a) => a.provider === "twitter"),
          google: accounts.some((a) => a.provider === "google"),
        }))
    : { linkedin: false, twitter: false, google: false };

  const envEnabled = (name: string) => (process.env[name] || "").trim().toLowerCase() !== "false";

  const features = {
    rag: hasGeminiKey,
    deepResearch: hasGeminiKey && hasSerperKey,
    autopilot: hasGeminiKey && hasSerperKey,
    publish: connectedProviders.linkedin || connectedProviders.twitter,
    agentic: envEnabled("FEATURE_AGENTIC") && hasGeminiKey,
  };

  return NextResponse.json({
    authenticated: Boolean(userId),
    hasGeminiKey,
    hasSerperKey,
    connectedProviders,
    features,
  });
}
