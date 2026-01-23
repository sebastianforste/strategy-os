"use client";

import { useState, useEffect } from "react";
import { Send, Calendar, Linkedin, ChevronDown, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { isLinkedInConnected, mockPostToLinkedIn, getLinkedInAuthUrl } from "../utils/linkedin-service";

interface PostButtonProps {
  text: string;
  clientId?: string;
}

export default function PostButton({ text, clientId }: PostButtonProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [isPosting, setIsPosting] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [postSuccess, setPostSuccess] = useState(false);

  useEffect(() => {
    setIsConnected(isLinkedInConnected());
  }, []);

  const handleConnect = () => {
    if (clientId) {
        // Use real OAuth URL if client ID is present
        // For demo/mock mode, we'll just simulate a successful connection
        if (clientId === 'demo') {
            localStorage.setItem("strategyos_linkedin_token", "mock_token");
            setIsConnected(true);
            return;
        }

        const redirectUri = window.location.origin; // Redirect back to home
        const authUrl = getLinkedInAuthUrl(clientId, redirectUri);
        window.location.href = authUrl;
    } else {
        alert("Please set your LinkedIn Client ID in Settings first.");
    }
  };

  const handlePostNow = async () => {
    setIsPosting(true);
    try {
      const result = await mockPostToLinkedIn(text);
      if (result.success) {
        setPostSuccess(true);
        setTimeout(() => setPostSuccess(false), 3000);
      }
    } catch (error) {
      console.error("Posting failed", error);
      alert("Failed to post to LinkedIn.");
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
