"use client";

import { TwitterLogo, Book, GithubLogo, GasPump } from "@phosphor-icons/react";

export function Footer() {
  return (
    <footer className="fixed bottom-0 w-full bg-black/20 backdrop-blur-sm border-t border-zinc-800">
      <div className="container mx-auto px-2 md:px-4 h-14">
        <div className="flex items-center justify-between h-full">
          {/* Version */}
          <div className="text-[10px] md:text-xs text-zinc-400">Asobi v1.0.0</div>

          {/* Social Links */}
          <div className="flex items-center space-x-2 md:space-x-4 mr-4 md:mr-0">
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-zinc-400 hover:text-white transition-colors"
            >
              <TwitterLogo className="w-4 h-4 md:w-7 md:h-7" weight="light" />
            </a>
            <div className="h-4 w-px bg-zinc-800" />
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-zinc-400 hover:text-white transition-colors"
            >
              <GithubLogo className="w-4 h-4 md:w-7 md:h-7" weight="light" />
            </a>
          </div>

          {/* Ethereum Stats */}
          <div className="flex items-center space-x-2 md:space-x-4">
            <div className="text-[10px] md:text-xs text-zinc-400">ETH: $2,345.67</div>
            <div className="h-4 w-px bg-zinc-800" />
            <div className="flex items-center text-[10px] md:text-xs text-zinc-400">
              <GasPump className="w-4 h-4 md:w-7 md:h-7 mr-1" weight="light" />
              25 gwei
            </div>
            <div className="h-4 w-px bg-zinc-800" />
            <div className="text-[10px] md:text-xs text-zinc-400">Block: 18934567</div>
          </div>
        </div>
      </div>
    </footer>
  );
}
