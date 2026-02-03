/**
 * AnimatedModal - Reusable Animated Modal Wrapper
 * ------------------------------------------------
 * Provides consistent, premium animations across all modals.
 * Uses Framer Motion with centralized animation variants.
 */

"use client";

import { motion, AnimatePresence } from "framer-motion";
import { modalBackdropVariants, modalContentVariants, buttonVariants } from "../utils/animations";
import { X } from "lucide-react";
import React from "react";

interface AnimatedModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  titleIcon?: React.ReactNode;
  children: React.ReactNode;
  maxWidth?: string;
  zIndex?: number;
}

export default function AnimatedModal({
  isOpen,
  onClose,
  title,
  titleIcon,
  children,
  maxWidth = "max-w-md",
  zIndex = 60,
}: AnimatedModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            variants={modalBackdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={onClose}
            className={`fixed inset-0 bg-black/80 backdrop-blur-sm`}
            style={{ zIndex: zIndex - 1 }}
          />
          
          {/* Content */}
          <motion.div
            variants={modalContentVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className={`fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full ${maxWidth} bg-[#0A0A0A] border border-neutral-800 p-8 rounded-2xl shadow-2xl`}
            style={{ zIndex }}
          >
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                {titleIcon}
                {title}
              </h2>
              <motion.button
                onClick={onClose}
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
                className="text-neutral-500 hover:text-white"
                aria-label="Close Modal"
              >
                <X className="w-5 h-5" />
              </motion.button>
            </div>
            
            {/* Body */}
            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

/**
 * AnimatedModalButton - Consistent primary action button for modals
 */
interface AnimatedModalButtonProps {
  onClick: () => void;
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "danger";
  className?: string;
}

export function AnimatedModalButton({ 
  onClick, 
  children, 
  variant = "primary",
  className = ""
}: AnimatedModalButtonProps) {
  const baseStyles = "w-full font-bold py-3 rounded-lg transition-colors";
  const variantStyles = {
    primary: "bg-white text-black hover:bg-neutral-200",
    secondary: "bg-neutral-800 text-white hover:bg-neutral-700",
    danger: "bg-red-600 text-white hover:bg-red-700",
  };
  
  return (
    <motion.button
      onClick={onClick}
      variants={buttonVariants}
      whileHover="hover"
      whileTap="tap"
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
    >
      {children}
    </motion.button>
  );
}
