"use client";

import { Button } from "@/components/ui/button";
import { Camera } from "@phosphor-icons/react";
import { useState, useCallback } from "react";

export function RecordButton({ canvasRef }) {
  const [isRecording, setIsRecording] = useState(false);
  const [progress, setProgress] = useState(0);

  const startRecording = useCallback(async () => {
    if (!canvasRef.current) return;

    try {
      setIsRecording(true);
      setProgress(0);
      const canvas = canvasRef.current;
      const stream = canvas.captureStream(30); // 30 FPS
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: "video/webm;codecs=vp9",
        videoBitsPerSecond: 5000000, // 5 Mbps for high quality
      });

      const chunks = [];
      mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: "video/webm" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `canvas-animation-${new Date().toISOString()}.webm`;
        a.click();
        URL.revokeObjectURL(url);
        setIsRecording(false);
        setProgress(0);
      };

      mediaRecorder.start();
      
      // Update progress every 100ms
      const duration = 10000; // 10 seconds
      const interval = 100; // 100ms updates
      const startTime = Date.now();
      
      const updateProgress = () => {
        const elapsed = Date.now() - startTime;
        if (elapsed < duration) {
          setProgress((elapsed / duration) * 100);
          setTimeout(updateProgress, interval);
        }
      };
      
      updateProgress();
      
      // Record for 10 seconds
      setTimeout(() => mediaRecorder.stop(), duration);
    } catch (error) {
      console.error("Error recording canvas:", error);
      setIsRecording(false);
      setProgress(0);
    }
  }, [canvasRef]);

  return (
    <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex flex-col items-center gap-2">
      <Button
        variant="outline"
        size="icon"
        className="bg-black/20 backdrop-blur-sm border-white/20 hover:bg-black/40 hover:border-white/40 transition-all duration-300"
        onClick={startRecording}
        disabled={isRecording}
      >
        <Camera
          className={`h-5 w-5 ${isRecording ? "text-red-500 animate-pulse" : "text-white"}`}
          weight="bold"
        />
      </Button>
      {isRecording && (
        <div className="text-xs text-white/80 font-medium">
          Recording... {Math.round(progress)}%
        </div>
      )}
    </div>
  );
}
