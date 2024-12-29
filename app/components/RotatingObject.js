"use client";
import { useEffect, useRef } from "react";

export default function RotatingObject({ showMatrixEffect = false }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    // Define constants first
    const MATRIX_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%&*+-./:;<=>?[]^_`{|}~¦";
    const MATRIX_COLORS = [
      "#00ff00", // Bright green
      "#33ff33",
      "#66ff66",
      "#99ff99",
      "#ccffcc",
      "#ffffff", // White for the leading character
    ];

    // Initial constants
    let SCREEN_WIDTH = Math.ceil(window.innerWidth / 15);
    let SCREEN_HEIGHT = Math.ceil(window.innerHeight / 15);
    const R1 = 0.6;
    const R2 = 1.2;
    const K2 = 5;
    const K1 = (Math.min(SCREEN_WIDTH, SCREEN_HEIGHT) * K2 * 3) / (8 * (R1 + R2));

    let output = new Array(SCREEN_WIDTH * SCREEN_HEIGHT).fill(" ");
    let zbuffer = new Array(SCREEN_WIDTH * SCREEN_HEIGHT).fill(0);
    let time = 0;
    let A = 0,
      B = 0;
    let burstProgress = -1;
    let lastBurstTime = 0;

    // Add dynamic speed variations
    const dynamicSpeed = {
      base: 1 + Math.sin(time * 0.5) * 0.3,
      pulse: Math.sin(time * 2) * 0.4 + Math.cos(time) * 0.3,
      twist: Math.cos(time * 1.5) * 0.5,
    };

    // Function to initialize matrix columns
    const initializeMatrixColumns = () => {
      return Array(SCREEN_WIDTH)
        .fill(0)
        .map(() => ({
          y: Math.random() * SCREEN_HEIGHT * 2 - SCREEN_HEIGHT,
          // Slower base speed with more variation
          speed: 0.05 + Math.random() * 0.15, // Changed from 0.2-0.5 to 0.05-0.2
          length: 5 + Math.floor(Math.random() * 15),
          chars: Array(20)
            .fill(0)
            .map(() => MATRIX_CHARS[Math.floor(Math.random() * MATRIX_CHARS.length)]),
          lastUpdate: 0,
          updateInterval: 100 + Math.random() * 200, // Changed from 50-150 to 100-300
          // Add dynamic speed variation
          speedCycle: Math.random() * Math.PI * 2,
          speedVariation: 0.02 + Math.random() * 0.03, // Small speed variation
        }));
    };

    // Update the canvas size function
    const updateCanvasSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;

      // Adjust the screen dimensions based on the viewport
      SCREEN_WIDTH = Math.ceil(window.innerWidth / 15);
      SCREEN_HEIGHT = Math.ceil(window.innerHeight / 15);

      // Reinitialize arrays with new dimensions
      output = new Array(SCREEN_WIDTH * SCREEN_HEIGHT).fill(" ");
      zbuffer = new Array(SCREEN_WIDTH * SCREEN_HEIGHT).fill(0);

      // Reinitialize matrix columns for the new width
      MATRIX_COLUMNS = initializeMatrixColumns();
    };

    let MATRIX_COLUMNS = initializeMatrixColumns();

    // Initial setup
    updateCanvasSize();
    window.addEventListener("resize", updateCanvasSize);

    // Add breathing effect base frequency
    let breathePhase = 0;

    // Enhanced color palette with more vibrant colors
    const COLORS = [
      "#1a1a2e",
      "#16213e",
      "#0f3460",
      "#247ba0",
      "#70d6ff",
      "#a2d2ff",
      "#e0fbfc",
      "#00ffff",
      "#80ffff",
      "#ff00ff", // Added magenta for energy bursts
      "#ff1493", // Added deep pink
    ];

    // Add bright versions of the colors for bursts
    const BRIGHT_COLORS = [
      "#4a4a8e", // Much brighter versions
      "#4661ae",
      "#3f84d0",
      "#54c0f0",
      "#b0f6ff",
      "#e2ffff",
      "#ffffff",
      "#80ffff",
      "#c0ffff",
      "#ff80ff",
      "#ff74c3",
    ];

    const CHARS = "✧●◆△⬡*.✦★"; // Added more varied characters

    function renderFrame() {
      output.fill(" ");
      zbuffer.fill(0);

      const cosA = Math.cos(A),
        sinA = Math.sin(A);
      const cosB = Math.cos(B),
        sinB = Math.sin(B);

      // Enhanced fluid motion
      const waveSpeed = 1.2;
      time += 0.02;
      breathePhase += 0.015;

      // Complex organic pulsing with multiple harmonics
      const breathe = Math.sin(breathePhase) * 0.3;
      const pulse = Math.sin(time * 1.5) * 0.3 + Math.sin(time * 0.7) * 0.2 + Math.sin(time * 0.3) * 0.1; // Added slower wave

      const secondaryPulse = Math.cos(time * 0.7) * 0.2 + Math.cos(time * 1.2) * 0.15 + Math.cos(time * 0.4) * 0.1; // Added slower wave

      // Handle color bursts
      const timeBetweenBursts = 2000; // More frequent bursts (2 seconds)
      const burstChance = 0.6; // Increased from 0.5
      const currentTime = Date.now();

      // Check if we should start a new burst
      if (burstProgress === -1 && currentTime - lastBurstTime > timeBetweenBursts) {
        if (Math.random() < burstChance) {
          burstProgress = 0;
          lastBurstTime = currentTime;
        }
      }

      // Update burst progress if active
      if (burstProgress >= 0) {
        burstProgress += 0.02;
        if (burstProgress > 1.2) {
          // Shorter travel distance
          burstProgress = -1;
        }
      }

      for (let theta = 0; theta < 2 * Math.PI; theta += 0.06) {
        const cosTheta = Math.cos(theta);
        const sinTheta = Math.sin(theta);

        for (let phi = 0; phi < 2 * Math.PI; phi += 0.015) {
          const cosPhi = Math.cos(phi);
          const sinPhi = Math.sin(phi);

          // Enhanced fluid morphing with multiple frequencies
          const morphFactor =
            Math.sin(time * waveSpeed * dynamicSpeed.base + theta * 3) * 0.4 +
            Math.cos(time * 0.7 * dynamicSpeed.pulse + phi * 2) * 0.3 +
            Math.sin(time * 0.5 * dynamicSpeed.twist + theta * 2) * 0.25;

          const electricPulse =
            Math.sin(time * 2.5 * dynamicSpeed.base + phi * 4) * 0.25 +
            Math.cos(time * 1.8 * dynamicSpeed.pulse + theta * 3) * 0.2 +
            Math.sin(time * 1.2 * dynamicSpeed.twist + phi * 2) * 0.15;

          // Enhanced organic movement
          const spiralEffect =
            Math.sin(theta * 5 + time * 2) * 0.15 +
            Math.cos(phi * 4 + time * 1.5) * 0.1 +
            Math.sin(theta * 3 + time * 0.7) * 0.08; // Added subtle spiral

          const vortexEffect =
            Math.cos(phi * 3 + time) * 0.2 +
            Math.sin(theta * 4 + time * 1.2) * 0.15 +
            Math.cos(phi * 2 + time * 0.6) * 0.1; // Added gentle vortex

          // Enhanced twisting with breathing
          const twistEffect =
            Math.sin(theta * 2 + phi * 2 + time * 1.5) * 0.2 +
            Math.cos(theta * 3 + phi * 3 + time * 0.8) * 0.15 +
            breathe * Math.sin(theta + phi) * 0.2; // Added breathing influence

          // Dynamic radius with more organic combinations
          const dynamicR1 = R1 * (1 + morphFactor + pulse + spiralEffect + twistEffect + breathe);
          const dynamicR2 = R2 * (1 + electricPulse + secondaryPulse + vortexEffect + breathe * 0.5);

          // More fluid shape deformation
          const circleX =
            dynamicR2 +
            dynamicR1 * cosTheta * (1 + 0.3 * Math.sin(3 * phi + time)) +
            0.2 * Math.sin(theta * 4 + time * 1.5) +
            0.15 * Math.cos(phi * 5 + time * 0.8) +
            0.1 * Math.sin(theta * 2 + phi * 2 + time * 0.5); // Added interweaving pattern

          const circleY =
            dynamicR1 * sinTheta * (1 + 0.2 * Math.cos(2 * theta + time)) +
            0.2 * Math.cos(phi * 3 + time * 2) +
            0.15 * Math.sin(theta * 6 + time * 1.2) +
            0.1 * Math.cos(theta * 3 + phi * 4 + time * 0.6); // Added flowing pattern

          // Enhanced electric field effect with more complexity
          const electricField =
            Math.sin(time * 3 + theta * 5) * Math.cos(phi * 3) * 0.2 +
            Math.cos(time * 2 + phi * 4) * Math.sin(theta * 3) * 0.15 +
            Math.sin(time * 1.5 + theta * 2 + phi * 2) * 0.1;

          // Enhanced 3D coordinates with electric field distortion
          const x = circleX * (cosB * cosPhi + sinA * sinB * sinPhi) - circleY * cosA * sinB + electricField;
          const y = circleX * (sinB * cosPhi - sinA * cosB * sinPhi) + circleY * cosA * cosB + electricField;
          const z = K2 + cosA * circleX * sinPhi + circleY * sinA;

          const ooz = 1 / z;
          const xp = Math.floor(SCREEN_WIDTH / 2 + K1 * ooz * x);
          const yp = Math.floor(SCREEN_HEIGHT / 2 - K1 * ooz * y);

          // Enhanced luminance with more dynamic range
          const L =
            (cosPhi * cosTheta * sinB -
              cosA * cosTheta * sinPhi -
              sinA * sinTheta +
              cosB * (cosA * sinTheta - cosTheta * sinA * sinPhi)) *
            (1 + Math.abs(electricField) + Math.abs(pulse) + Math.abs(twistEffect));

          if (L > 0 && xp >= 0 && xp < SCREEN_WIDTH && yp >= 0 && yp < SCREEN_HEIGHT) {
            const pos = xp + yp * SCREEN_WIDTH;
            if (ooz > zbuffer[pos]) {
              zbuffer[pos] = ooz;
              // Enhanced character selection with more varied patterns
              const sparkChance = Math.random();
              let char;
              if (sparkChance > 0.99) {
                char = CHARS[0]; // Lightning bolt
              } else if (sparkChance > 0.95) {
                char = CHARS[CHARS.length - 1]; // Star
              } else {
                char = CHARS[Math.floor((L * 8 + time) % (CHARS.length - 2)) + 1];
              }
              output[pos] = char;
            }
          }
        }
      }

      // Enhanced rendering with stronger glow
      context.fillStyle = "#000810";
      context.fillRect(0, 0, canvas.width, canvas.height);

      const charSize = Math.min(canvas.width / (SCREEN_WIDTH + 8), canvas.height / (SCREEN_HEIGHT + 8));
      context.font = `${charSize}px monospace`;

      const startX = (canvas.width - SCREEN_WIDTH * charSize) / 2;
      const startY = (canvas.height - SCREEN_HEIGHT * charSize) / 2;

      // Enhanced glow effect
      context.shadowBlur = 20 + Math.sin(time * 3) * 5;
      context.shadowColor = `hsl(${(time * 70) % 360}, 100%, ${50 + Math.sin(time * 2) * 20}%)`;

      for (let y = 0; y < SCREEN_HEIGHT; y++) {
        const line = output.slice(y * SCREEN_WIDTH, (y + 1) * SCREEN_WIDTH);
        for (let x = 0; x < SCREEN_WIDTH; x++) {
          const char = line[x];
          if (char !== " ") {
            const luminanceIndex = CHARS.indexOf(char);
            const colorIndex = Math.floor((luminanceIndex / CHARS.length) * COLORS.length);

            // Calculate distance from center for burst effect
            const centerX = SCREEN_WIDTH / 2;
            const centerY = SCREEN_HEIGHT / 2;
            const distanceFromCenter =
              Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2)) /
              Math.sqrt(Math.pow(SCREEN_WIDTH / 2, 2) + Math.pow(SCREEN_HEIGHT / 2, 2));

            // Apply burst effect if active
            if (burstProgress >= 0) {
              const burstDistance = Math.abs(distanceFromCenter - burstProgress);
              const burstEffect = Math.max(0, 1 - burstDistance * 3); // Wider burst wave (changed from 5 to 3)

              if (burstEffect > 0) {
                // Add extra glow during burst
                context.shadowBlur = 25; // Increased glow
                context.shadowColor = BRIGHT_COLORS[Math.min(colorIndex, BRIGHT_COLORS.length - 1)];

                // Interpolate with higher factor for more intensity
                const normalColor = COLORS[Math.min(colorIndex, COLORS.length - 1)];
                const brightColor = BRIGHT_COLORS[Math.min(colorIndex, BRIGHT_COLORS.length - 1)];
                context.fillStyle = interpolateColors(normalColor, brightColor, burstEffect * 1.5);
              } else {
                context.shadowBlur = 20;
                context.fillStyle = COLORS[Math.min(colorIndex, COLORS.length - 1)];
              }
            } else {
              context.fillStyle = COLORS[Math.min(colorIndex, COLORS.length - 1)];
            }

            context.fillText(char, startX + x * charSize, startY + (y + 1) * charSize);
          }
        }
      }

      // Wrap matrix effect in conditional
      if (showMatrixEffect) {
        // After rendering the rotating object, add the matrix effect
        for (let x = 0; x < SCREEN_WIDTH; x++) {
          const column = MATRIX_COLUMNS[x];

          // Update character positions with dynamic speed
          column.speedCycle += 0.015;
          const currentSpeed = column.speed + Math.sin(column.speedCycle) * (column.speedVariation * 1.5);
          column.y += currentSpeed * dynamicSpeed.base;

          if (column.y > SCREEN_HEIGHT + column.length) {
            column.y = -column.length;
            column.speed = 0.05 + Math.random() * 0.15;
            column.length = 5 + Math.floor(Math.random() * 15);
            column.speedCycle = Math.random() * Math.PI * 2;
            column.speedVariation = 0.02 + Math.random() * 0.03;
          }

          // Render the column
          for (let i = 0; i < column.length; i++) {
            const y = Math.floor(column.y) - i;
            if (y >= 0 && y < SCREEN_HEIGHT) {
              const char = column.chars[i % column.chars.length];
              const fadeIndex = Math.floor((i / column.length) * MATRIX_COLORS.length);

              const screenX = (x / SCREEN_WIDTH) * canvas.width;
              const screenY = (y / SCREEN_HEIGHT) * canvas.height;

              context.fillStyle = MATRIX_COLORS[fadeIndex];
              context.shadowBlur = i === 0 ? 15 : 5;
              context.shadowColor = MATRIX_COLORS[0];
              context.globalAlpha = 1 - i / column.length;
              context.fillText(char, screenX, screenY);
              context.globalAlpha = 1;
            }
          }
        }
      }

      // Reset shadow properties for next frame
      context.shadowBlur = 20;
      context.shadowColor = `hsl(${(time * 50) % 360}, 100%, 50%)`;

      A += 0.005 * (1 + pulse * 0.3 + breathe * 0.25);
      B += 0.004 * (1 + secondaryPulse * 0.3 + breathe * 0.2);

      requestAnimationFrame(renderFrame);
    }

    renderFrame();

    return () => {
      window.removeEventListener("resize", updateCanvasSize);
    };
  }, [showMatrixEffect]);

  // Add color interpolation helper function
  function interpolateColors(color1, color2, factor) {
    const r1 = parseInt(color1.substring(1, 3), 16);
    const g1 = parseInt(color1.substring(3, 5), 16);
    const b1 = parseInt(color1.substring(5, 7), 16);

    const r2 = parseInt(color2.substring(1, 3), 16);
    const g2 = parseInt(color2.substring(3, 5), 16);
    const b2 = parseInt(color2.substring(5, 7), 16);

    const r = Math.round(r1 + (r2 - r1) * factor);
    const g = Math.round(g1 + (g2 - g1) * factor);
    const b = Math.round(b1 + (b2 - b1) * factor);

    return `#${(r < 16 ? "0" : "") + r.toString(16)}${(g < 16 ? "0" : "") + g.toString(16)}${
      (b < 16 ? "0" : "") + b.toString(16)
    }`;
  }

  return (
    <div className="fixed inset-0 bg-[#000810]">
      <canvas ref={canvasRef} className="w-full h-full" />
    </div>
  );
}
