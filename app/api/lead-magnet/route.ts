
import { LeadMagnetService, MagnetType } from "@/utils/lead-magnet-service";
import { resolveGeminiKey } from "@/utils/server-api-keys";
import { z } from "zod";

import { authOptions } from "@/utils/auth";
import { HttpError, jsonError, parseJson, rateLimit, requireSessionForRequest } from "@/utils/request-guard";

export async function POST(req: Request) {
    try {
        const session = await requireSessionForRequest(req, authOptions);
        await rateLimit({ key: `lead_magnet:${session.user.id}`, limit: 10, windowMs: 60_000 });

        const { topic, audience, type, apiKey } = await parseJson(
          req,
          z
            .object({
              topic: z.string().min(1).max(200),
              audience: z.string().min(1).max(200),
              type: z.string().min(1).max(64),
              apiKey: z.string().min(1).max(512).optional(),
            })
            .strict(),
        );

        const resolvedKey = (await resolveGeminiKey(apiKey)) || process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || "";
        if (!resolvedKey) return new Response("API Key required", { status: 400 });

        if (resolvedKey.toLowerCase().trim() === "demo") {
          return new Response(
            JSON.stringify({
              type,
              title: "[DEMO] Lead Magnet",
              headline: "A concrete asset with a clear promise.",
              hook: "You don't need more ideas. You need a repeatable system.",
              sections: [
                { title: "Step 1", content: "Define the before/after state.", actionItem: "Write the promise in one sentence." },
                { title: "Step 2", content: "Ship a checklist and a scoring rubric.", actionItem: "Create 7 criteria." },
              ],
              landingPage: {
                headline: "Get the asset",
                subheadline: "A short, high-signal guide.",
                bullets: ["Specific", "Actionable", "Fast to implement"],
                cta: "Download",
              },
              emailSequence: [{ subject: "Here it is", body: "Asset attached.", delay: "Immediate" }],
            }),
            { headers: { "Content-Type": "application/json" } }
          );
        }

        const service = new LeadMagnetService(resolvedKey);
        const magnet = await service.generateMagnet(topic, audience, type as MagnetType);

        return new Response(JSON.stringify(magnet), {
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error: any) {
        if (error instanceof HttpError) {
          return jsonError(error.status, error.message, error.code);
        }
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
}
