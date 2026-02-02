"use client";

import { useState } from "react";
import { Send, Calendar, Linkedin, ChevronDown, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { signIn, useSession } from "next-auth/react";
import { createPostingJob, executePostingJob } from "../utils/posting-agent";

interface PostButtonProps {
  text: string;
}

export default function PostButton({ text }: PostButtonProps) {
  const { status } = useSession();
  const [isPosting, setIsPosting] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [postSuccess, setPostSuccess] = useState(false);

  const isConnected = status === "authenticated";

  const handleConnect = () => {
    signIn("linkedin");
  };

  const handlePostNow = async () => {
    setIsPosting(true);
    try {
      // Create a transient job for this immediate post
      const job = createPostingJob(text, "linkedin");
      
      const result = await executePostingJob(job.id);
      
      if (result.status === "posted") {
        setPostSuccess(true);
        setTimeout(() => setPostSuccess(false), 3000);
      } else {
        throw new Error(result.error || "Posting failed");
      }
    } catch (error) {
      console.error("Posting failed", error);
      alert("Failed to post to LinkedIn. " + (error instanceof Error ? error.message : ""));
    } finally {
      setIsPosting(false);
      setShowDropdown(false);
    }
  };

  const handleShareIntent = () => {
    const linkedinUrl = `https://www.linkedin.com/feed/?shareActive=true&text=${encodeURIComponent(
      text
    )}`;
    window.open(linkedinUrl, "_blank");
    setShowDropdown(false);
  };

  if (!isConnected) {
    return (
      <button
        onClick={handleConnect}
        className="flex items-center gap-2 bg-[#0077b5] hover:bg-[#006396] text-white px-4 py-2 rounded-lg font-bold text-xs transition-colors"
      >
        <Linkedin className="w-4 h-4" />
        CONNECT LINKEDIN
      </button>
    );
  }

  return (
    <div className="relative">
      <div className="flex bg-[#0077b5] rounded-lg overflow-hidden">
        <button
          onClick={handlePostNow}
          disabled={isPosting || postSuccess}
          className="flex items-center gap-2 px-4 py-2 hover:bg-[#006396] transition-colors disabled:opacity-70 disabled:cursor-not-allowed text-white font-bold text-xs"
        >
          {isPosting ? (
            "POSTING..."
          ) : postSuccess ? (
            <>
              <CheckCircle2 className="w-4 h-4" />
              POSTED
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              POST NOW
            </>
          )}
        </button>
        <div className="w-px bg-[#006396]" />
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="px-2 hover:bg-[#006396] transition-colors text-white"
        >
          <ChevronDown className="w-4 h-4" />
        </button>
      </div>

      <AnimatePresence>
        {showDropdown && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute top-full right-0 mt-2 w-48 bg-[#1A1A1A] border border-neutral-800 rounded-lg shadow-xl overflow-hidden z-50"
          >
            <button
              onClick={() => {
                  alert("Scheduling coming in Phase 10.2!");
                  setShowDropdown(false);
              }}
              className="w-full text-left px-4 py-3 text-xs text-neutral-300 hover:bg-neutral-800 hover:text-white flex items-center gap-2 transition-colors"
            >
              <Calendar className="w-4 h-4" />
              Schedule Post
            </button>
            <button
              onClick={handleShareIntent}
              className="w-full text-left px-4 py-3 text-xs text-neutral-300 hover:bg-neutral-800 hover:text-white flex items-center gap-2 transition-colors border-t border-neutral-800"
            >
              <Linkedin className="w-4 h-4" />
              Open in LinkedIn (Legacy)
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
