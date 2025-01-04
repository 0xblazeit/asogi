"use client";
import { motion } from "framer-motion";
import { RetroCountdown } from "../components/RetroCountdown";

export default function AboutPage() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.75 }}>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-3xl md:text-5xl font-bold text-white z-10 tracking-widest">
        <h1 className="text-4xl font-bold text-white text-center">wen</h1>
        <RetroCountdown />
      </div>
    </motion.div>
  );
}
