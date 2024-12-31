"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { Terminal } from "@phosphor-icons/react";

const asciiArt = `
 █████  ███████  ██████  ██████  ██ 
██   ██ ██      ██    ██ ██   ██ ██ 
███████ ███████ ██    ██ ██████  ██ 
██   ██      ██ ██    ██ ██   ██ ██ 
██   ██ ███████  ██████  ██████  ██ 
`;

const messages = [
  "> Initializing ASOBI system...",
  "> CHAIN: BASE L2",
  "> SUPPLY: 1696",
  "> TOKEN STANDARD: ERC720",
  "> PRICE: 0.0069 ETH",
  "> STATUS: PENDING",
];

function LoadingDots() {
  return (
    <motion.div className="flex gap-1 mt-1">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="w-1 h-1 bg-green-400 rounded-full"
          animate={{ opacity: [0.2, 1, 0.2], scale: [0.8, 1.2, 0.8] }}
          transition={{
            duration: 1,
            repeat: Infinity,
            delay: i * 0.2,
          }}
        />
      ))}
    </motion.div>
  );
}

export function TerminalTyping() {
  const [displayedMessages, setDisplayedMessages] = useState([]);
  const [currentMessage, setCurrentMessage] = useState("");
  const [messageIndex, setMessageIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [showAscii, setShowAscii] = useState(false);
  const [isTyping, setIsTyping] = useState(true);

  useEffect(() => {
    if (messageIndex < messages.length) {
      if (charIndex < messages[messageIndex].length) {
        const timer = setTimeout(() => {
          setCurrentMessage((prev) => prev + messages[messageIndex][charIndex]);
          setCharIndex((prev) => prev + 1);
        }, Math.random() * 50 + 30); // Random typing speed for more natural effect

        return () => clearTimeout(timer);
      } else {
        const nextMessageTimer = setTimeout(() => {
          setDisplayedMessages((prev) => [...prev, currentMessage]);
          setCurrentMessage("");
          setCharIndex(0);
          setMessageIndex((prev) => prev + 1);
        }, 500);

        return () => clearTimeout(nextMessageTimer);
      }
    } else if (!showAscii) {
      const asciiTimer = setTimeout(() => {
        setIsTyping(false);
        setShowAscii(true);
      }, 800);

      return () => clearTimeout(asciiTimer);
    }
  }, [messageIndex, charIndex, currentMessage, showAscii]);

  return (
    <div className="w-full max-w-3xl mx-auto p-2 sm:p-4">
      <div className="bg-black/40 rounded-lg p-3 sm:p-4 text-green-400 shadow-xl border border-green-500/20">
        <div className="flex items-center gap-2 mb-3 sm:mb-4 border-b border-green-500/20 pb-2">
          <Terminal className="w-4 h-4 sm:w-5 sm:h-5" />
          <span className="text-xs sm:text-sm">ASOBI Terminal</span>
        </div>

        <AnimatePresence mode="popLayout">
          {displayedMessages.map((message, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="mb-1.5 sm:mb-2 text-sm sm:text-base"
            >
              {message}
            </motion.div>
          ))}
        </AnimatePresence>

        {currentMessage && (
          <div className="mb-1.5 sm:mb-2 text-sm sm:text-base">
            {currentMessage}
            {isTyping && <LoadingDots />}
          </div>
        )}

        {showAscii && (
          <motion.pre
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="text-[0.6rem] sm:text-xs leading-tight mt-3 sm:mt-4 text-purple-400 whitespace-pre font-mono overflow-x-auto"
          >
            {asciiArt}
          </motion.pre>
        )}

        <motion.div
          animate={{ opacity: [0, 1] }}
          transition={{ repeat: Infinity, duration: 0.8 }}
          className="inline-block w-2 h-4 bg-green-400 ml-1"
        />
      </div>
    </div>
  );
}
