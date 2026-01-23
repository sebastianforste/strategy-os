"use client";

import { motion } from "framer-motion";
import { Linkedin, ExternalLink } from "lucide-react";

interface ShareButtonProps {
  text: string;
}

export default function ShareButton({ text }: ShareButtonProps) {
  const handleShare = () => {
    const url = `https://www.linkedin.com/feed/?shareActive=true&text=${encodeURIComponent(
      text
    )}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={handleShare}
      className="flex items-center gap-2 px-3 py-1.5 bg-[#0077b5] text-white rounded hover:bg-[#006097] transition-colors text-xs font-bold"
    >
      <Linkedin className="w-3 h-3" />
      POST TO LINKEDIN
      <ExternalLink className="w-3 h-3 opacity-70" />
    </motion.button>
  );
}
