"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

const words = ["Art", "Creativity", "Free Flowing"];
const description =
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.";

function PixelText({ text }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const characters = Array.from(text);

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.04,
      },
    },
  };

  const charVariants = {
    hidden: {
      opacity: 0,
      scale: 0,
      filter: "blur(10px)",
    },
    visible: {
      opacity: 1,
      scale: 1,
      filter: "blur(0px)",
      transition: {
        type: "spring",
        damping: 12,
        stiffness: 200,
      },
    },
  };

  return (
    <motion.span
      style={{ display: "inline-block" }}
      variants={containerVariants}
      initial="hidden"
      animate={isVisible ? "visible" : "hidden"}
    >
      {characters.map((char, index) => (
        <motion.span
          key={index}
          variants={charVariants}
          style={{
            display: "inline-block",
            whiteSpace: "pre",
          }}
          className="relative"
        >
          {char}
        </motion.span>
      ))}
    </motion.span>
  );
}

export function TypewriterText() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.8,
        delayChildren: 0.5,
      },
    },
  };

  const itemVariants = {
    hidden: {
      opacity: 0,
      y: 50,
      scale: 0.8,
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.7,
        ease: "easeOut",
        opacity: { duration: 0.8 },
      },
    },
  };

  return (
    <motion.div
      className="flex flex-col items-center justify-center min-h-[70vh] px-4 text-center"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="space-y-6">
        {words.map((word, index) => (
          <motion.div key={word} variants={itemVariants} className="text-2xl md:text-4xl font-bold tracking-tighter">
            <PixelText text={word} />
          </motion.div>
        ))}

        <motion.p variants={itemVariants} className="mt-8 text-sm md:text-lg text-muted-foreground max-w-2xl mx-auto">
          <PixelText text={description} />
        </motion.p>
      </div>
    </motion.div>
  );
}
