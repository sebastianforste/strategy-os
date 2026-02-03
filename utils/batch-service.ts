/**
 * BATCH SERVICE - Automation Pipeline
 * ------------------------------------
 * Generates multiple posts in bulk for scheduling.
 */

import { GoogleGenAI } from "@google/genai";
import { schedulePost } from "./archive-service";
import { Persona, PERSONAS, PersonaId } from "./personas";
import { AI_CONFIG } from "./config";
import { generateStrategyVariants, StrategyAngle } from "./variant-generator";

const PRIMARY_MODEL = AI_CONFIG.primaryModel;

export interface BatchRequest {
    topics: string[];
    personaId: PersonaId;
    platform: 'linkedin' | 'twitter' | 'substack';
    startDate: Date;
    intervalHours: number; // Hours between posts
}

export interface VolumeRequest extends BatchRequest {
    angles: StrategyAngle[];
}

export interface BatchResult {
    scheduled: number;
    failed: number;
    posts: { topic: string; scheduledFor: string; id?: string }[];
}

/**
 * GENERATE BATCH POSTS
 * Creates N posts and schedules them at regular intervals.
 */
export async function generateBatch(request: BatchRequest, apiKey: string): Promise<BatchResult> {
    const genAI = new GoogleGenAI({ apiKey });
    const persona = PERSONAS[request.personaId] || PERSONAS.cso;
    
    const result: BatchResult = {
        scheduled: 0,
        failed: 0,
        posts: []
    };

    let currentScheduleTime = new Date(request.startDate);

    for (const topic of request.topics) {
        try {
            // Generate post content
            const prompt = buildBatchPrompt(topic, persona, request.platform);
            
            const response = await genAI.models.generateContent({
                model: PRIMARY_MODEL,
                contents: prompt
            });

            const content = response.text || "";
            
            if (content.length > 10) {
                // Schedule the post
                const id = await schedulePost({
                    content,
                    topic,
                    scheduledFor: currentScheduleTime.toISOString(),
                    platform: request.platform
                });
                
                result.posts.push({
                    topic,
                    scheduledFor: currentScheduleTime.toISOString(),
                    id
                });
                result.scheduled++;
            } else {
                result.posts.push({ topic, scheduledFor: currentScheduleTime.toISOString() });
                result.failed++;
            }
        } catch (e) {
            console.error(`Batch generation failed for topic: ${topic}`, e);
            result.posts.push({ topic, scheduledFor: currentScheduleTime.toISOString() });
            result.failed++;
        }

        // Move to next time slot
        currentScheduleTime = new Date(currentScheduleTime.getTime() + request.intervalHours * 60 * 60 * 1000);
    }

    return result;
}

/**
 * GENERATE VOLUME BATCH
 * Expands topics into a full matrix of variants based on angles.
 */
export async function generateVolumeBatch(request: VolumeRequest, apiKey: string): Promise<BatchResult> {
    const result: BatchResult = {
        scheduled: 0,
        failed: 0,
        posts: []
    };

    let currentScheduleTime = new Date(request.startDate);

    for (const topic of request.topics) {
        try {
            console.log(`[BatchService] Generating Volume Matrix for: ${topic}`);
            
            // Generate multiple variants per topic
            const variants = await generateStrategyVariants(topic, request.angles, apiKey, request.platform);
            
            for (const variant of variants) {
                const id = await schedulePost({
                    content: variant.content,
                    topic: `${topic} (${variant.angle})`,
                    scheduledFor: currentScheduleTime.toISOString(),
                    platform: request.platform
                });

                result.posts.push({
                    topic: `${topic} (${variant.angle})`,
                    scheduledFor: currentScheduleTime.toISOString(),
                    id
                });
                result.scheduled++;

                // Increment time for EACH variant
                currentScheduleTime = new Date(currentScheduleTime.getTime() + request.intervalHours * 60 * 60 * 1000);
            }
        } catch (e) {
            console.error(`Volume generation failed for topic: ${topic}`, e);
            result.failed++;
        }
    }

    return result;
}

function buildBatchPrompt(topic: string, persona: Persona, platform: string): string {
    const platformGuidance = platform === 'twitter' 
        ? "Keep it under 280 characters. Sharp. Punchy." 
        : platform === 'substack'
        ? "Write a compelling hook paragraph for a newsletter intro."
        : "Write a LinkedIn post. ~150-250 words. Include a hook, insight, and CTA.";

    return `
        You are ${persona.name}. ${persona.description}
        
        ${persona.basePrompt || ''}
        
        TOPIC: ${topic}
        PLATFORM: ${platform}
        
        ${platformGuidance}
        
        Write the post now. No meta-commentary. Just the content.
    `;
}
