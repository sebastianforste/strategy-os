
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "../../../../utils/db";
import { authOptions } from "../../../../utils/auth";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
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
    console.error("Connections API Error:", error);
    return NextResponse.json({ error: "Failed to fetch connections" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { provider } = await req.json();

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
    console.error("Delete Connection Error:", error);
    return NextResponse.json({ error: "Failed to delete connection" }, { status: 500 });
  }
}
