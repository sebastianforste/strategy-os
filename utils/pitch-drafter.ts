
import { MediaOpportunity } from "./media-scanner";

export interface PitchDraft {
  subject: string;
  body: string;
}

export async function draftColdPitch(opportunity: MediaOpportunity, personaName: string): Promise<PitchDraft> {
  const hostName = opportunity.host.split(" ")[0]; // First name
  
  let hook = "";
  if (opportunity.type === "Podcast") {
    hook = `I just finished listening to your episode on "${opportunity.recentTopic}" - the point about AI integration was spot on.`;
  } else {
    hook = `I've been a subscriber for months. Your recent deep dive on "${opportunity.recentTopic}" was widely shared in our internal Slack.`;
  }

  const subject = `Guest Idea: ${opportunity.recentTopic} (and the missing angle)`;
  
  const body = `Hi ${hostName},

${hook}

I'm ${personaName}, and I've been building meaningful traction discussing the exact opposite side of that argument.

I'd love to share 3 specific insights with your audience:
1. Why "Best Practices" are killing growth in 2026.
2. The "Hidden Metric" most founders ignore until Series B.
3. How we automated 40% of our strategy work without losing quality.

No pressure at all, but thought this might fit your current season effectively.

Best,
${personaName}`;

  return { subject, body };
}
