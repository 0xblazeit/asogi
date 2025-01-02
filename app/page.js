"use client";

import RotatingObject from "./components/RotatingObject";
import { WelcomeText } from "./components/WelcomeText";
import { MintButton } from "./components/MintButton";
import { useRef, useState } from "react";

export default function Home() {
  const canvasRef = useRef(null);
  const [showMintButton, setShowMintButton] = useState(false);

  return (
    <main className="h-fit w-fit overflow-hidden">
      <RotatingObject walletAddress="0xcEB780385e065697669E33a07266303598D085fB" canvasRef={canvasRef} />
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-3xl md:text-5xl font-bold text-white z-10 tracking-widest">
        <WelcomeText onComplete={() => setShowMintButton(true)} />
        <div className="flex justify-center mt-8">
          <MintButton canvasRef={canvasRef} show={showMintButton} />
        </div>
      </div>
    </main>
  );
}
