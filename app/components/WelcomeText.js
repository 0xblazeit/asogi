"use client";

import { motion } from "framer-motion";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.3,
      delayChildren: 0.3,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 50,
      damping: 20,
    },
  },
};

export function WelcomeText({ onComplete }) {
  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      onAnimationComplete={() => onComplete?.()}
      className="flex flex-col items-center justify-center space-y-3 md:space-y-6 text-center px-4 py-4 md:py-8"
    >
      <motion.h1 variants={item} className="text-2xl md:text-4xl font-bold text-white tracking-widest">
        Asobi
      </motion.h1>
      <motion.p variants={item} className="text-sm md:text-xl text-gray-300 max-w-lg tracking-normal">
        A generative ascii art canvas
      </motion.p>
      <motion.div variants={item} className="grid grid-cols-2 gap-3 w-full max-w-lg">
        <div className="space-y-0.5">
          <div className="text-neutral-300 text-xs md:text-sm font-normal tracking-tight">BLOCKCHAIN</div>
          <div className="text-neutral-500 text-xs md:text-sm font-normal tracking-tight">░░░░░░░░</div>
        </div>
        <div className="space-y-0.5">
          <div className="text-neutral-300 text-xs md:text-sm font-normal tracking-tight">TOKEN STANDARD</div>
          <div className="text-neutral-500 text-xs md:text-sm font-normal tracking-tight">░░░░░░░░</div>
        </div>
      </motion.div>

      <motion.div variants={item} className="space-y-0.5 w-full max-w-lg">
        <div className="text-neutral-300 text-xs md:text-sm font-normal tracking-tight">CONTRACT ADDRESS</div>
        <div className="text-neutral-500 text-xs md:text-sm font-normal tracking-tight">░░░░░░░░░░░░░░░░░░░░</div>
      </motion.div>
    </motion.div>
  );
}
