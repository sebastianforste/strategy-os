
import { LeadMagnetService, MagnetType } from "@/utils/lead-magnet-service";

export async function POST(req: Request) {
    try {
        const { topic, audience, type, apiKey } = await req.json();

        if (!apiKey) return new Response("API Key required", { status: 400 });

        const service = new LeadMagnetService(apiKey);
        const magnet = await service.generateMagnet(topic, audience, type as MagnetType);

        return new Response(JSON.stringify(magnet), {
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error: any) {
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
}
