
import { NextResponse } from "next/server";
import { GoogleAIFileManager, FileState } from "@google/generative-ai/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from "fs";
import path from "path";
import os from "os";
import { z } from "zod";

import { authOptions } from "@/utils/auth";
import { HttpError, jsonError, parseJson, rateLimit, requireSession } from "@/utils/request-guard";

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || "");
const fileManager = new GoogleAIFileManager(process.env.GEMINI_API_KEY || "");

export async function POST(req: Request) {
  let tempFilePath: string | null = null;
  try {
    await requireSession(authOptions);
    rateLimit({ key: "audio_transcribe", limit: 10, windowMs: 60_000 });

    const formData = await parseJson(
      req,
      z
        .object({
          audio: z.string().min(1).max(15_000_000), // base64 string cap
          mimeType: z.string().max(100).optional(),
        })
        .strict(),
    );
    const { audio, mimeType } = formData; // Base64 for simplicity in MVP

    if (!audio) {
      return NextResponse.json({ error: "No audio provided" }, { status: 400 });
    }

    // Convert base64 to temporary file
    const buffer = Buffer.from(audio, 'base64');
    tempFilePath = path.join(os.tmpdir(), `upload_${Date.now()}.webm`);
    fs.writeFileSync(tempFilePath, buffer);

    console.log(`[Transcribe] Uploading to Google AI... ${tempFilePath}`);

    // Upload to Google AI File Manager
    const uploadResult = await fileManager.uploadFile(tempFilePath, {
      mimeType: mimeType || 'audio/webm',
      displayName: "Voice Input",
    });

    // Wait for file to be ready
    let file = await fileManager.getFile(uploadResult.file.name);
    while (file.state === FileState.PROCESSING) {
      process.stdout.write(".");
      await new Promise((resolve) => setTimeout(resolve, 2_000));
      file = await fileManager.getFile(uploadResult.file.name);
    }

    if (file.state === FileState.FAILED) {
      throw new Error("Audio processing failed.");
    }

    // Generate content (transcription)
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent([
      {
        fileData: {
          mimeType: file.mimeType,
          fileUri: file.uri,
        },
      },
      { text: "Please transcribe this audio exactly as it is spoken. If there are multiple speakers, identify them as Speaker 1, Speaker 2, etc. If it's a content idea, output it clearly." },
    ]);

    const transcription = result.response.text();

    // Clean up
    if (tempFilePath) fs.unlinkSync(tempFilePath);
    // await fileManager.deleteFile(file.name); // Optional: delete from cloud

    return NextResponse.json({ transcription });
  } catch (error: any) {
    if (error instanceof HttpError) {
      return jsonError(error.status, error.message, error.code);
    }
    console.error("[Transcribe API] Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  } finally {
    if (tempFilePath) {
      try {
        if (fs.existsSync(tempFilePath)) fs.unlinkSync(tempFilePath);
      } catch {
        // ignore cleanup failures
      }
    }
  }
}
