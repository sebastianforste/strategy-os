
"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "../utils/auth";
import { verifyClaims } from "../utils/research-engine";

export async function verifyContentAction(content: string, apiKey: string) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) throw new Error("Unauthorized");

    // In a real app, we might use a server-side key or the user's key passed in.
    // Here we accept apiKey from client (provided by user in settings) or fall back to server env if configured.
    // Ideally use process.env.GOOGLE_API_KEY if not passed, but for now we follow the pattern.
    
    const keyToUse = apiKey || process.env.GOOGLE_API_KEY || "";
    if (!keyToUse) throw new Error("No API Key available for verification");

    try {
        const results = await verifyClaims(content, keyToUse);
        return { success: true, results };
    } catch (e: any) {
        console.error("Verification Action Error", e);
        return { success: false, error: e.message };
    }
}
