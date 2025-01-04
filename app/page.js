"use client";

import { WelcomeText } from "./components/WelcomeText";

export default function Home() {
  const generateRandomWalletAddress = () => {
    // Generate a random 40-character hexadecimal string (20 bytes)
    const randomBytes = Array.from({ length: 20 }, () => Math.floor(Math.random() * 256));

    return "0x" + randomBytes.map((byte) => byte.toString(16).padStart(2, "0")).join("");
  };

  const walletAddress = generateRandomWalletAddress();

  return (
    <main className="h-fit w-fit overflow-hidden">
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-3xl md:text-5xl font-bold text-white z-10 tracking-widest">
        <WelcomeText />
      </div>
    </main>
  );
}
