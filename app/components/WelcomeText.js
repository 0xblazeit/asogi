"use client";

import { motion } from "framer-motion";
import { RetroCountdown } from "./RetroCountdown";
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

export function WelcomeText() {
  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="flex flex-col items-center justify-center space-y-5 md:space-y-8 text-center px-4 py-4 md:py-8"
    >
      <motion.h1 variants={item} className="text-3xl md:text-5xl font-bold text-white tracking-widest">
        A generative ascii art project
      </motion.h1>
      <motion.p variants={item} className="text-xl md:text-2xl text-gray-300 max-w-lg tracking-normal">
        dynamic morphing 3D art within a 2D canvas
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
      <motion.div variants={item} className="space-y-0.5 w-full max-w-lg">
        <RetroCountdown />
      </motion.div>
    </motion.div>
  );
}
