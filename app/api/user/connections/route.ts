
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../utils/db";
import { authOptions } from "../../../../utils/auth";
import { HttpError, jsonError, parseJson, rateLimit, requireSessionForRequest } from "@/utils/request-guard";
import { z } from "zod";

export async function GET(req: NextRequest) {
  try {
    const session = await requireSessionForRequest(req, authOptions);
    await rateLimit({ key: `connections_get:${session.user.id}`, limit: 60, windowMs: 60_000 });

    // Check for connected accounts in database
    const accounts = await prisma.account.findMany({
      where: {
        userId: session.user.id
      },
      select: {
        provider: true
      }
    });

    // Map to simple object { linkedin: true, twitter: false }
    const connections = {
      linkedin: accounts.some(a => a.provider === "linkedin"),
      twitter: accounts.some(a => a.provider === "twitter"),
      google: accounts.some(a => a.provider === "google"),
    };

    return NextResponse.json(connections);
  } catch (error) {
    if (error instanceof HttpError) {
      return jsonError(error.status, error.message, error.code);
    }
    console.error("Connections API Error:", error);
    return NextResponse.json({ error: "Failed to fetch connections" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await requireSessionForRequest(req, authOptions);
    await rateLimit({ key: `connections_delete:${session.user.id}`, limit: 30, windowMs: 60_000 });

    const { provider } = await parseJson(
      req,
      z
        .object({
          provider: z.string().min(1).max(64),
        })
        .strict(),
    );

    if (!provider) {
      return NextResponse.json({ error: "Provider required" }, { status: 400 });
    }

    // Delete the connection
    await prisma.account.deleteMany({
      where: {
        userId: session.user.id,
        provider: provider
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof HttpError) {
      return jsonError(error.status, error.message, error.code);
    }
    console.error("Delete Connection Error:", error);
    return NextResponse.json({ error: "Failed to delete connection" }, { status: 500 });
  }
}
