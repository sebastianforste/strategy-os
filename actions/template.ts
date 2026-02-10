
"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "../utils/auth";
import { prisma } from "../utils/db";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || "");

export async function createTemplate(content: string, name: string, category: string = "General") {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Unauthorized");

  const template = await prisma.template.create({
    data: {
      content,
      name,
      category,
      userId: session.user.id
    }
  });

  return { success: true, template };
}

export async function getTemplates() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return [];

  return await prisma.template.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" }
  });
}

export async function deleteTemplate(id: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Unauthorized");

  await prisma.template.deleteMany({
    where: { 
      id,
      userId: session.user.id
    }
  });

  return { success: true };
}

export async function remixTemplateAction(templateId: string, newTopic: string) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) throw new Error("Unauthorized");

    const template = await prisma.template.findFirst({
        where: { id: templateId, userId: session.user.id }
    });

    if (!template) throw new Error("Template not found");

    // Increment usage
    await prisma.template.update({
        where: { id: templateId },
        data: { usageCount: { increment: 1 } }
    });

    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    
    const prompt = `
    You are a master ghostwriter. 
    REMIX the following template for a new topic.
    KEEP the exact structure, tone, and formatting.
    Only change the subject matter.

    TEMPLATE:
    ${template.content}

    NEW TOPIC:
    ${newTopic}

    OUTPUT (MD format only):
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
}
