
import { NextResponse } from "next/server";
import { prisma } from "../../../../utils/db";

export async function POST(req: Request) {
  try {
    const { type, content, title, source } = await req.json();

    console.log(`[EXTENSION] Received: ${type} from ${source}`);

    // If "clip", add to StrategyOS 'Inbox' or 'Signals'
    // For now, we will add it as a "Resource" (Phase 19) or "Signal" (Ghost)
    
    // Let's create a Signal for the Ghost Agent to pick up
    // However, Signal DB isn't strictly defined yet, so let's log and create a "Resource"
    
    // MVP: Create a Resource
    const newResource = await prisma.resource.create({
        data: {
            title: title || "Clipped Content",
            type: "web",
            url: source,
            metadata: { snippet: content, clippedAt: new Date() }
        }
    });

    return NextResponse.json({ success: true, id: newResource.id });
  } catch (error) {
    console.error("[EXTENSION API] Error ingest:", error);
    return NextResponse.json({ success: false, error: "Failed to ingest" }, { status: 500 });
  }
}

export async function GET() {
    return NextResponse.json({ status: "StrategyOS Extension API Active" });
}
