"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { TextScramble } from './TextScramble';

function getSupportedMimeType() {
  const types = [
    "video/webm",
    "video/webm;codecs=vp8",
    "video/webm;codecs=h264",
    "video/mp4"
  ];

  return types.find(type => MediaRecorder.isTypeSupported(type));
}

export function MintButton({ canvasRef, show }) {
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [progress, setProgress] = useState(0);
  const RECORDING_DURATION = 15000; // 15 seconds in milliseconds

  useEffect(() => {
    let intervalId;
    if (isRecording) {
      const startTime = Date.now();
      intervalId = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const newProgress = Math.min((elapsed / RECORDING_DURATION) * 100, 100);
        setProgress(newProgress);
        
        if (elapsed >= RECORDING_DURATION) {
          clearInterval(intervalId);
        }
      }, 50); // Update every 50ms for smooth animation
    } else {
      setProgress(0);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isRecording]);

  async function startRecording() {
    try {
      if (!canvasRef.current) return;

      const stream = canvasRef.current.captureStream(60); // 60fps for smooth recording
      
      // Get supported MIME type
      const mimeType = getSupportedMimeType();
      if (!mimeType) {
        throw new Error("No supported mime type found for recording");
      }

      const recorder = new MediaRecorder(stream, {
        mimeType: mimeType,
      });

      const chunks = [];
      recorder.ondataavailable = (e) => chunks.push(e.data);

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `hinata-clip-${Date.now()}.webm`;
        a.click();
        URL.revokeObjectURL(url);
      };

      setMediaRecorder(recorder);
      recorder.start();
      setIsRecording(true);

      // Stop recording after 15 seconds
      setTimeout(() => {
        if (recorder.state === "recording") {
          recorder.stop();
          setIsRecording(false);
        }
      }, 15000);
    } catch (error) {
      console.error("Error starting recording:", error);
      setIsRecording(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={show ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{
        type: "spring",
        stiffness: 50,
        damping: 20
      }}
    >
      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
        <Button
          onClick={startRecording}
          disabled={isRecording}
          className={cn(
            "relative overflow-hidden font-bold min-w-[120px]",
            isRecording ? "bg-purple-500 hover:bg-purple-500 cursor-not-allowed" : "bg-[#4381DF] hover:bg-[#3671cf]",
            "transition-colors duration-300"
          )}
        >
          <span className="flex items-center gap-2">
            {isRecording ? (
              <>
                <div className="relative w-5 h-5">
                  <svg className="w-fit h-fit transform -rotate-90" viewBox="0 0 20 20">
                    <circle
                      cx="10"
                      cy="10"
                      r="8"
                      strokeWidth="2"
                      stroke="white"
                      fill="none"
                      strokeDasharray={`${2 * Math.PI * 8}`}
                      strokeDashoffset={`${2 * Math.PI * 8 * (1 - progress / 100)}`}
                      className="transition-all duration-100"
                    />
                  </svg>
                </div>
                <span className="tracking-tight">Minting...</span>
              </>
            ) : (
              <>
                <Image 
                  src="/logo-asobi.svg" 
                  alt="Asobi Logo" 
                  width={20} 
                  height={20}
                  className="w-5 h-5"
                />
                <span className="tracking-tight">
                  <TextScramble text="MINT" />
                </span>
              </>
            )}
          </span>
          {isRecording && (
            <motion.div
              className="absolute inset-0 bg-purple-400 opacity-20"
              animate={{
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          )}
        </Button>
      </motion.div>
    </motion.div>
  );
}
