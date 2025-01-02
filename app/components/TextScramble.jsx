"use client";

import { useState, useEffect } from 'react';

export function TextScramble({ text }) {
  const [displayText, setDisplayText] = useState('');
  
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ013579@#$%&';
  
  useEffect(() => {
    let interval;
    let iteration = 0;
    const maxIterations = 20; // Increased iterations for longer effect

    // Start with random text
    setDisplayText(
      text
        .split('')
        .map(() => characters[Math.floor(Math.random() * characters.length)])
        .join('')
    );

    const scramble = () => {
      if (iteration >= maxIterations) {
        setDisplayText(text);
        clearInterval(interval);
        return;
      }

      setDisplayText(
        text
          .split('')
          .map((char, index) => {
            if (char === ' ') return char;
            const randomChar = characters[Math.floor(Math.random() * characters.length)];
            return Math.random() < iteration / maxIterations ? text[index] : randomChar;
          })
          .join('')
      );

      iteration += 0.3; // Slower iteration increment for longer effect
    };

    interval = setInterval(scramble, 100); // Increased interval time for slower effect
    return () => clearInterval(interval);
  }, [text]);

  return <span>{displayText}</span>;
}
