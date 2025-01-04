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
    const targetDate = new Date("2025-01-06T16:20:00-05:00");

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
    <div className="flex items-center space-x-2 p-2 rounded-lg">
      <HourglassMedium className="text-gray-200 size-5 md:size-8" weight="fill" />
      <div className="flex space-x-1 text-gray-200 text-xl">
        <div className="p-1 rounded">{padZero(timeLeft.days)}</div>
        <span>:</span>
        <div className="p-1 rounded">{padZero(timeLeft.hours)}</div>
        <span>:</span>
        <div className="p-1 rounded">{padZero(timeLeft.minutes)}</div>
        <span>:</span>
        <div className="p-1 rounded">{padZero(timeLeft.seconds)}</div>
      </div>
    </div>
  );
}
