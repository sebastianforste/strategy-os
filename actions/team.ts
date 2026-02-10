
"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "../utils/auth";
import { prisma } from "../utils/db";
import { Role } from "@prisma/client";
import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";

export async function createTeamAction(name: string, slug: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { success: false, error: "Unauthorized" };

  try {
    // Check if slug exists
    const existing = await prisma.team.findUnique({ where: { slug } });
    if (existing) return { success: false, error: "Team URL is already taken" };

    // Create Team
    const team = await prisma.team.create({
      data: {
        name,
        slug,
        members: {
          connect: { id: session.user.id }
        }
      }
    });

    // Update User Role to ADMIN
    await prisma.user.update({
      where: { id: session.user.id },
      data: { role: Role.ADMIN, teamId: team.id }
    });

    revalidatePath("/settings");
    return { success: true, team };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export async function inviteMemberAction(email: string, role: Role = Role.MEMBER) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return { success: false, error: "Unauthorized" };

    // Get verify user is admin/editor
    const user = await prisma.user.findUnique({ where: { id: session.user.id } });
    if (!user?.teamId) return { success: false, error: "You are not in a team" };
    if (user.role !== "ADMIN" && user.role !== "EDITOR") return { success: false, error: "Insufficient permissions" };

    // Create Invitation
    const token = randomUUID();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    await prisma.invitation.create({
        data: {
            email,
            teamId: user.teamId,
            role,
            token,
            expiresAt
        }
    });

    // In a real app, send email here.
    // For now, return the link.
    const inviteLink = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/join/${token}`;
    return { success: true, inviteLink };
}

export async function acceptInviteAction(token: string) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return { success: false, error: "Unauthorized" };

    const invite = await prisma.invitation.findUnique({ where: { token } });
    if (!invite) return { success: false, error: "Invalid invitation" };

    if (new Date() > invite.expiresAt) return { success: false, error: "Invitation expired" };

    // Update User
    await prisma.user.update({
        where: { id: session.user.id },
        data: {
            teamId: invite.teamId,
            role: invite.role
        }
    });

    // Delete invite
    await prisma.invitation.delete({ where: { id: invite.id } });

    revalidatePath("/");
    return { success: true, teamId: invite.teamId };
}

export async function getTeamDetailsAction() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return { success: false, error: "Unauthorized" };

    const user = await prisma.user.findUnique({ 
        where: { id: session.user.id },
        include: { team: { include: { members: true, invitations: true } } }
    });

    if (!user?.team) return { success: false, error: "No team found" };

    return { success: true, team: user.team };
}
