/**
 * POSTING AGENT - 2027 Computer Use for Autonomous Posting
 * 
 * Browser automation patterns for LinkedIn posting.
 * NOTE: This is a DESIGN PATTERN file - actual posting requires:
 * 1. LinkedIn API OAuth (preferred) or
 * 2. Puppeteer/Playwright in a server environment
 * 
 * This service provides the interface and mock for UI development.
 */

// --- TYPES ---

export interface PostingJob {
  id: string;
  content: string;
  platform: "linkedin" | "twitter";
  imageUrl?: string;
  scheduledFor?: Date;
  status: "pending" | "approved" | "posting" | "posted" | "failed";
  postedUrl?: string;
  error?: string;
}

export interface PostingProgress {
  phase: "preparing" | "authenticating" | "composing" | "posting" | "complete" | "failed";
  message: string;
}

// In-memory job store (would be IndexedDB in production)
const jobs: Map<string, PostingJob> = new Map();

// --- PUBLIC API ---

/**
 * CREATE POSTING JOB
 * ------------------
 * Creates a new posting job that requires user approval.
 */
export function createPostingJob(
  content: string,
  platform: "linkedin" | "twitter",
  imageUrl?: string,
  scheduledFor?: Date
): PostingJob {
  const job: PostingJob = {
    id: `post-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    content,
    platform,
    imageUrl,
    scheduledFor,
    status: "pending"
  };
  
  jobs.set(job.id, job);
  console.log(`[Posting Agent] Job created: ${job.id}`);
  
  return job;
}

/**
 * APPROVE POSTING JOB
 * -------------------
 * User approves a job for posting.
 */
export function approveJob(id: string): PostingJob | null {
  const job = jobs.get(id);
  if (job && job.status === "pending") {
    job.status = "approved";
    jobs.set(id, job);
    console.log(`[Posting Agent] Job approved: ${id}`);
    return job;
  }
  return null;
}

/**
 * EXECUTE POSTING JOB
 * -------------------
 * Executes the posting via API or browser automation.
 * 
 * IMPORTANT: This is a mock implementation.
 * Real implementation would use:
 * - LinkedIn Marketing API (OAuth)
 * - Twitter API v2 (OAuth 2.0)
 */
export async function executePostingJob(
  id: string,
  onProgress?: (progress: PostingProgress) => void
): Promise<PostingJob> {
  const job = jobs.get(id);
  
  if (!job) {
    throw new Error(`Job not found: ${id}`);
  }
  
  job.status = "posting";
  jobs.set(id, job);
  
  onProgress?.({ phase: "preparing", message: "Preparing post..." });
  await sleep(500);
  
  onProgress?.({ phase: "authenticating", message: "Authenticating..." });
  
  try {
    const response = await fetch("/api/distribute", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        platform: job.platform,
        content: job.content,
        imageUrl: job.imageUrl,
      }),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.error || "Distribution failed");
    }

    onProgress?.({ phase: "posting", message: "Publishing to " + job.platform + "..." });
    await sleep(1000);

    job.status = "posted";
    job.postedUrl = data.url || `https://${job.platform}.com/post/${job.id}`;
    onProgress?.({ phase: "complete", message: "Posted successfully!" });
    
    onProgress?.({ phase: "complete", message: "Posted successfully!" });
    
  } catch (e: unknown) {
    const errorMsg = e instanceof Error ? e.message : "Unknown distribution error";
    job.status = "failed";
    job.error = errorMsg;
    onProgress?.({ phase: "failed", message: errorMsg });
  }
  
  jobs.set(id, job);
  return job;
}

/**
 * GET ALL JOBS
 * ------------
 * Returns all posting jobs.
 */
export function getAllJobs(): PostingJob[] {
  return Array.from(jobs.values()).sort(
    (a, b) => parseInt(b.id.split("-")[1]) - parseInt(a.id.split("-")[1])
  );
}

/**
 * GET JOB BY ID
 * -------------
 */
export function getJob(id: string): PostingJob | undefined {
  return jobs.get(id);
}

/**
 * CANCEL JOB
 * ----------
 */
export function cancelJob(id: string): boolean {
  const job = jobs.get(id);
  if (job && job.status === "pending") {
    jobs.delete(id);
    return true;
  }
  return false;
}

// --- UTILITIES ---

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * CHECK LINKEDIN AUTH STATUS
 * --------------------------
 * Checks if LinkedIn OAuth token is available.
 */
export function checkLinkedInAuth(): boolean {
  // Authentication is now handled via NextAuth session.
  // The UI should use useSession() to verify status.
  // This helper is kept for backward compatibility but always returns true
  // to allow the API to handle the actual auth check.
  return typeof window !== "undefined"; 
}

/**
 * CHECK TWITTER AUTH STATUS
 * -------------------------
 */
export function checkTwitterAuth(): boolean {
  if (typeof localStorage !== "undefined") {
    return !!localStorage.getItem("twitter_access_token");
  }
  return false;
}
