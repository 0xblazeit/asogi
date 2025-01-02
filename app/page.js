"use client";

import RotatingObject from "./components/RotatingObject";
import { WelcomeText } from "./components/WelcomeText";
import { RecordButton } from "./components/RecordButton";
import { useRef } from "react";

export default function Home() {
  const canvasRef = useRef(null);

  return (
    <main className="h-fit w-fit overflow-hidden">
      <RotatingObject walletAddress="0xcEB780385e065697669E33a07266303598D085fB" canvasRef={canvasRef} />
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-3xl md:text-5xl font-bold text-white z-10 tracking-widest">
        <WelcomeText />
      </div>
      {/* <RecordButton canvasRef={canvasRef} /> */}
    </main>
  );
}
