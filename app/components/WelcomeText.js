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

export function WelcomeText() {
  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="flex flex-col items-center justify-center space-y-4 text-center px-4 py-12 md:py-24"
    >
      <motion.h1 variants={item} className="text-3xl md:text-4xl font-bold text-white">
        Discover the unknown
      </motion.h1>
      <motion.p variants={item} className="text-lg md:text-xl text-gray-400 max-w-2xl">
        A dynamic canvas, forged by the ethers of the blockchain
      </motion.p>
    </motion.div>
  );
}
