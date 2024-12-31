"use client";

import { XLogo, Book, GithubLogo, GasPump, Cube, CurrencyEth } from "@phosphor-icons/react";
import { useEthPrice } from "@/hooks/useEthPrice";
import { useQuery } from "@tanstack/react-query";

async function fetchBaseBlock() {
  const response = await fetch("/api/base-block");
  if (!response.ok) {
    throw new Error("Network response was not ok");
  }
  return response.json();
}

async function fetchGasPrice() {
  const response = await fetch("/api/base-gwei");
  if (!response.ok) {
    throw new Error("Network response was not ok");
  }
  return response.json();
}

export default function FooterContent() {
  const { data: ethData } = useEthPrice();
  const { data: blockData, isLoading: isBlockLoading } = useQuery({
    queryKey: ["baseBlock"],
    queryFn: fetchBaseBlock,
    refetchOnWindowFocus: true,
    refetchInterval: 12000, // Refetch every 12 seconds
  });

  const { data: gasData, isLoading: isGasLoading } = useQuery({
    queryKey: ["baseGas"],
    queryFn: fetchGasPrice,
    refetchOnWindowFocus: true,
    refetchInterval: 600000, // Refetch every 10 minutes
  });

  const blockNumber = blockData?.data?.number;

  return (
    <div className="container mx-auto w-full px-2 md:px-4 h-full">
      <div className="flex items-center justify-between h-full">
        {/* Version */}
        <div className="flex items-center space-x-1 md:space-x-2 text-zinc-400">
          <span className="text-[9px] md:text-[12px] md:text-xs">Asobi v.BETA</span>
        </div>

        <div className="flex items-center space-x-2 md:space-x-4">
          <div className="text-[10px] md:text-xs text-zinc-400 flex items-center gap-1">
            <div className="flex items-center space-x-1 text-zinc-400">
              <CurrencyEth className="w-4 h-4 md:w-5 md:h-5" weight="light" />
              <span>
                {ethData?.price
                  ? `$${ethData.price.toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}`
                  : "--.--"}
              </span>
            </div>
          </div>
          <div className="h-4 w-px bg-zinc-800" />
          {/* Block Number */}
          <div className="flex items-center space-x-1 text-zinc-400">
            <Cube className="w-4 h-4 md:w-5 md:h-5" weight="light" />
            <span className="text-[10px] md:text-xs">{isBlockLoading ? "" : blockNumber?.toLocaleString()}</span>
          </div>

          <div className="h-4 w-px bg-zinc-800" />
          {/* GWEI */}
          <div className="flex items-center text-zinc-400">
            <GasPump className="w-4 h-4  md:w-5 md:h-5 mr-1" weight="light" />
            <span className="text-[10px] md:text-xs">{isGasLoading ? "" : `${gasData?.data?.gwei} gwei`}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
