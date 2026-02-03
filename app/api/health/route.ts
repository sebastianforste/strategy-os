import { NextResponse } from "next/server";
import { prisma } from "../../../utils/db";

export async function GET() {
  try {
    // Basic query to check DB availability
    await prisma.resource.count();
    return NextResponse.json({ status: "ok" });
  } catch (e) {
    console.error("[Health Check] DB Failure:", e);
    return NextResponse.json({ status: "error", message: "Database unreachable" }, { status: 500 });
  }
}
