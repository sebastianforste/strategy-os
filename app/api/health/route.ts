import { NextResponse } from "next/server";
import { prisma } from "../../../utils/db";
import { authOptions } from "@/utils/auth";
import { HttpError, jsonError, requireSession } from "@/utils/request-guard";

export async function GET() {
  try {
    await requireSession(authOptions);
    // Basic query to check DB availability
    await prisma.resource.count();
    return NextResponse.json({ status: "ok" });
  } catch (e) {
    if (e instanceof HttpError) {
      return jsonError(e.status, e.message, e.code);
    }
    console.error("[Health Check] DB Failure:", e);
    return NextResponse.json({ status: "error", message: "Database unreachable" }, { status: 500 });
  }
}
