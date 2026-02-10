
import { NextResponse } from "next/server";
import { saveStrategy } from "@/actions/history"; // Server Action reuse
import { GeneratedAssets } from "@/utils/ai-service";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { historyItems } = body;

    if (!Array.isArray(historyItems)) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    let successCount = 0;
    let failCount = 0;

    // Process in parallel (or batches)
    const results = await Promise.all(
        historyItems.map(async (item: any) => {
            // Map LocalStorage item structure to our Server Action params
            if (!item.input || !item.assets) return false;

            const result = await saveStrategy({
                input: item.input,
                assets: item.assets as GeneratedAssets,
                personaId: item.personaId || "cso",
                createdAt: item.createdAt ? new Date(item.createdAt) : undefined,
                rating: item.performance?.rating || undefined,
            });
            return result.success;
        })
    );

    successCount = results.filter(Boolean).length;
    failCount = results.length - successCount;

    return NextResponse.json({ success: true, migrated: successCount, failed: failCount });
  } catch (error) {
    console.error("Migration failed:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
