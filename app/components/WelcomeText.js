"use client";

import { motion } from "framer-motion";
import { RetroCountdown } from "./RetroCountdown";
import { ChartDonut } from "@phosphor-icons/react";
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
      <motion.h1 variants={item} className="text-3xl md:text-4xl font-bold text-white tracking-widest">
        A generative ASCII art project
      </motion.h1>
      <motion.p variants={item} className="text-lg md:text-xl text-gray-300 max-w-lg tracking-normal">
        Inspired by a{" "}
        <a
          href="https://www.a1k0n.net/2011/07/20/donut-math.html"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-white transition-colors"
        >
          rotating donut
        </a>
      </motion.p>
      <motion.div variants={item} className="flex items-center justify-center">
        <motion.div
          animate={{
            rotateY: 360,
            rotateZ: 360,
          }}
          transition={{
            duration: 8,
            ease: "linear",
            repeat: Infinity,
          }}
          style={{
            transformStyle: "preserve-3d",
            perspective: 1000,
          }}
        >
          <ChartDonut className="size-6 md:size-8" />
        </motion.div>
      </motion.div>

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
