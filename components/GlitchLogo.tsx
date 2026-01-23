"use client";

import { motion } from "framer-motion";
import { useState } from "react";

export default function GlitchLogo() {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="relative cursor-default"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <h1 className="text-2xl font-bold tracking-tighter text-white relative z-10">
        STRATEGY<span className="text-neutral-500">OS</span>
      </h1>
      
      {/* Red Shift */}
      {isHovered && (
        <motion.div
          initial={{ opacity: 0, x: 0 }}
          animate={{ opacity: 0.8, x: -2 }}
          transition={{ repeat: Infinity, duration: 0.1, repeatType: "mirror" }}
          className="absolute top-0 left-0 text-2xl font-bold tracking-tighter text-red-500 opacity-50 mix-blend-screen pointer-events-none select-none"
        >
          STRATEGY<span className="text-red-900">OS</span>
        </motion.div>
      )}

      {/* Blue Shift */}
      {isHovered && (
        <motion.div
          initial={{ opacity: 0, x: 0 }}
          animate={{ opacity: 0.8, x: 2 }}
          transition={{ repeat: Infinity, duration: 0.1, repeatType: "mirror", delay: 0.05 }}
          className="absolute top-0 left-0 text-2xl font-bold tracking-tighter text-blue-500 opacity-50 mix-blend-screen pointer-events-none select-none"
        >
          STRATEGY<span className="text-blue-900">OS</span>
        </motion.div>
      )}
    </div>
  );
}
