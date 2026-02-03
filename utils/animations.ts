/**
 * Animation Variants & Utilities
 * --------------------------------
 * Centralized Framer Motion configurations for consistent, premium animations.
 */

import { Variants } from "framer-motion";

/**
 * CARD ANIMATIONS
 */
export const cardVariants: Variants = {
  hidden: { 
    opacity: 0, 
    y: 20,
    scale: 0.95
  },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      delay: i * 0.05, // Stagger by 50ms
      duration: 0.4,
      ease: [0.25, 0.46, 0.45, 0.94] // Custom ease-out
    }
  }),
  hover: {
    y: -4,
    scale: 1.02,
    boxShadow: "0 20px 40px rgba(0, 0, 0, 0.4)",
    transition: {
      duration: 0.2,
      ease: "easeOut"
    }
  },
  tap: {
    scale: 0.98
  }
};

/**
 * BUTTON ANIMATIONS
 */
export const buttonVariants: Variants = {
  idle: {
    scale: 1
  },
  hover: {
    scale: 1.05,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 10
    }
  },
  tap: {
    scale: 0.95,
    transition: {
      type: "spring",
      stiffness: 600,
      damping: 15
    }
  }
};

/**
 * TOGGLE SWITCH ANIMATIONS
 */
export const toggleVariants: Variants = {
  off: {
    x: 0,
    backgroundColor: "rgba(163, 163, 163, 0.3)"
  },
  on: {
    x: 20,
    backgroundColor: "rgba(34, 197, 94, 1)", // green-500
    transition: {
      type: "spring",
      stiffness: 500,
      damping: 30
    }
  }
};

/**
 * MODAL ANIMATIONS
 */
export const modalBackdropVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { duration: 0.2 }
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.15 }
  }
};

export const modalContentVariants: Variants = {
  hidden: { 
    opacity: 0, 
    scale: 0.9,
    y: 20
  },
  visible: { 
    opacity: 1, 
    scale: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 25
    }
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: { duration: 0.15 }
  }
};

/**
 * STATUS INDICATOR ANIMATIONS
 */
export const pulseVariants: Variants = {
  pulse: {
    opacity: [0.5, 1, 0.5],
    scale: [1, 1.05, 1],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

export const checkmarkVariants: Variants = {
  hidden: {
    pathLength: 0,
    opacity: 0
  },
  visible: {
    pathLength: 1,
    opacity: 1,
    transition: {
      pathLength: { type: "spring", duration: 0.6, bounce: 0 },
      opacity: { duration: 0.2 }
    }
  }
};

export const shakeVariants: Variants = {
  shake: {
    x: [0, -10, 10, -10, 10, 0],
    transition: {
      duration: 0.4
    }
  }
};

/**
 * SHIMMER EFFECT (for skeleton loaders)
 */
export const shimmerVariants: Variants = {
  shimmer: {
    backgroundPosition: ["200% 0", "-200% 0"],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "linear"
    }
  }
};

/**
 * STAGGER CONTAINER
 * Use with children that have cardVariants
 */
export const staggerContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05
    }
  }
};

/**
 * UTILITY: Ripple Effect Component
 */
export const rippleVariants: Variants = {
  initial: {
    opacity: 0.6,
    scale: 0
  },
  animate: {
    opacity: 0,
    scale: 2,
    transition: {
      duration: 0.6,
      ease: "easeOut"
    }
  }
};

/**
 * ACCESSIBILITY: Respect prefers-reduced-motion
 */
export const prefersReducedMotion = 
  typeof window !== "undefined" 
    ? window.matchMedia("(prefers-reduced-motion: reduce)").matches 
    : false;

export const getTransition = (spring = false) => {
  if (prefersReducedMotion) {
    return { duration: 0.01 }; // Near-instant for accessibility
  }
  return spring 
    ? { type: "spring", stiffness: 300, damping: 25 }
    : { duration: 0.3, ease: "easeOut" };
};
