"use client";

import React from 'react';
import { motion } from 'framer-motion';

interface MechanicalOdometerProps {
  value: number;
  label?: string;
  digits?: number;
}

const DigitReel = ({ digit }: { digit: number }) => {
  return (
    <div className="relative w-[16px] h-[24px] bg-[#0F1115] border border-white/5 rounded-sm overflow-hidden select-none will-change-transform">
       <motion.div
         animate={{ y: -digit * 24 }}
         transition={{ type: "spring", stiffness: 260, damping: 20 }}
         className="flex flex-col"
       >
         {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
           <div key={n} className="h-[24px] flex items-center justify-center text-[10px] font-mono tabular-nums font-bold text-white">
             {n}
           </div>
         ))}
       </motion.div>
       {/* High-status vertical blur / lighting */}
       <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-black/40 via-transparent to-black/40" />
    </div>
  );
};

export function MechanicalOdometer({ value, label, digits = 4 }: MechanicalOdometerProps) {
  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  // Pad the value to the required number of digits
  const paddedValue = value.toString().padStart(digits, '0');
  const digitArray = paddedValue.split('').map(Number);

  if (!isMounted) {
    return (
      <div className="flex flex-col items-start gap-1">
        {label && <span className="text-[8px] font-bold text-[#4A4E54] uppercase tracking-[0.2em]">{label}</span>}
        <div className="flex items-center gap-0.5">
          {Array.from({ length: digits }).map((_, i) => (
            <div key={i} className="w-[16px] h-[24px] bg-[#0F1115] border border-white/5 rounded-sm" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-start gap-1">
      {label && <span className="text-[8px] font-bold text-[#4A4E54] uppercase tracking-[0.2em]">{label}</span>}
      <div className="flex items-center gap-0.5">
        {digitArray.map((d, i) => (
          <DigitReel key={i} digit={d} />
        ))}
      </div>
    </div>
  );
}
