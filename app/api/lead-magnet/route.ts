
import { LeadMagnetService, MagnetType } from "@/utils/lead-magnet-service";
import { z } from "zod";

import { authOptions } from "@/utils/auth";
import { HttpError, jsonError, parseJson, rateLimit, requireSession } from "@/utils/request-guard";

export async function POST(req: Request) {
    try {
        await requireSession(authOptions);
        rateLimit({ key: "lead_magnet", limit: 10, windowMs: 60_000 });

        const { topic, audience, type, apiKey } = await parseJson(
          req,
          z
            .object({
              topic: z.string().min(1).max(200),
              audience: z.string().min(1).max(200),
              type: z.string().min(1).max(64),
              apiKey: z.string().min(1).max(512),
            })
            .strict(),
        );

        if (!apiKey) return new Response("API Key required", { status: 400 });

        const service = new LeadMagnetService(apiKey);
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
