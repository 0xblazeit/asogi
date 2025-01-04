"use client";

import { useState, useEffect } from "react";
import { HourglassMedium } from "@phosphor-icons/react";

// Pure function to calculate time difference
function calculateTimeLeft(targetDate) {
  const difference = targetDate - new Date();

  if (difference <= 0) {
    return {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
    };
  }

  return {
    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((difference / 1000 / 60) % 60),
    seconds: Math.floor((difference / 1000) % 60),
  };
}

// Pad single digit numbers with leading zero
function padZero(num) {
  return num.toString().padStart(2, "0");
}

export function RetroCountdown() {
  const [isClient, setIsClient] = useState(false);
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    setIsClient(true);
    const targetDate = new Date("2025-01-09T16:20:00-05:00");

    const updateTimeLeft = () => {
      setTimeLeft(calculateTimeLeft(targetDate));
    };

    updateTimeLeft(); // Initial call
    const timer = setInterval(updateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, []);

  if (!isClient) {
    return (
      <div className="flex items-center space-x-2 p-2 rounded-lg">
        <HourglassMedium className="text-gray-400" weight="fill" />
        <div className="flex space-x-1 text-gray-400 text-xl">
          <div className="p-1 rounded">00</div>
          <span>:</span>
          <div className="p-1 rounded">00</div>
          <span>:</span>
          <div className="p-1 rounded">00</div>
          <span>:</span>
          <div className="p-1 rounded">00</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center space-x-2 sm:space-x-4 p-2 rounded-lg">
      <HourglassMedium className="text-gray-200 size-6 md:size-8 lg:size-10" weight="fill" />
      <div className="flex flex-col items-center">
        <div className="flex space-x-1 sm:space-x-2 md:space-x-4 text-gray-200 text-base sm:text-lg md:text-xl lg:text-2xl">
          <div className="flex flex-col items-center">
            <div className="p-1 rounded">{padZero(timeLeft.days)}</div>
            <div className="text-[10px] sm:text-xs text-gray-400 uppercase tracking-tighter sm:tracking-normal">
              Day
            </div>
          </div>
          <span className="self-center">:</span>
          <div className="flex flex-col items-center">
            <div className="p-1 rounded">{padZero(timeLeft.hours)}</div>
            <div className="text-[10px] sm:text-xs text-gray-400 uppercase tracking-tighter sm:tracking-normal">
              Hours
            </div>
          </div>
          <span className="self-center">:</span>
          <div className="flex flex-col items-center">
            <div className="p-1 rounded">{padZero(timeLeft.minutes)}</div>
            <div className="text-[10px] sm:text-xs text-gray-400 uppercase tracking-tighter sm:tracking-normal">
              Mins
            </div>
          </div>
          <span className="self-center">:</span>
          <div className="flex flex-col items-center">
            <div className="p-1 rounded">{padZero(timeLeft.seconds)}</div>
            <div className="text-[10px] sm:text-xs text-gray-400 uppercase tracking-tighter sm:tracking-normal">
              Secs
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
