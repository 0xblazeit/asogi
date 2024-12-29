"use client";
import { useEffect, useRef } from "react";

export default function RotatingObject() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    // Function to update canvas size
    const updateCanvasSize = () => {
      const containerWidth = canvas.parentElement.clientWidth;
      const containerHeight = canvas.parentElement.clientHeight;
      // Make sure we maintain aspect ratio and have enough height
      const size = Math.min(containerWidth, containerHeight) * 0.8;
      canvas.width = size;
      canvas.height = size;
    };

    // Initial size setup and window resize listener
    updateCanvasSize();
    window.addEventListener("resize", updateCanvasSize);

    const SCREEN_WIDTH = 50;
    const SCREEN_HEIGHT = 50;
    const R1 = 0.5;
    const R2 = 1.0;
    const K2 = 10;
    const K1 = (SCREEN_WIDTH * K2 * 3) / (8 * (R1 + R2));

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

    const CHARS = "✧●◆△⬡*.✦★"; // Added more varied characters

    let output = new Array(SCREEN_WIDTH * SCREEN_HEIGHT).fill(" ");
    let zbuffer = new Array(SCREEN_WIDTH * SCREEN_HEIGHT).fill(0);
    let time = 0;
    let A = 0,
      B = 0;

    function renderFrame() {
      output.fill(" ");
      zbuffer.fill(0);

      const cosA = Math.cos(A),
        sinA = Math.sin(A);
      const cosB = Math.cos(B),
        sinB = Math.sin(B);

      // Enhanced fluid motion
      const waveSpeed = 0.8;
      time += 0.016;
      breathePhase += 0.01; // Slow breathing cycle

      // Complex organic pulsing with multiple harmonics
      const breathe = Math.sin(breathePhase) * 0.3;
      const pulse = Math.sin(time * 1.5) * 0.3 + Math.sin(time * 0.7) * 0.2 + Math.sin(time * 0.3) * 0.1; // Added slower wave

      const secondaryPulse = Math.cos(time * 0.7) * 0.2 + Math.cos(time * 1.2) * 0.15 + Math.cos(time * 0.4) * 0.1; // Added slower wave

      for (let theta = 0; theta < 2 * Math.PI; theta += 0.07) {
        const cosTheta = Math.cos(theta);
        const sinTheta = Math.sin(theta);

        for (let phi = 0; phi < 2 * Math.PI; phi += 0.02) {
          const cosPhi = Math.cos(phi);
          const sinPhi = Math.sin(phi);

          // Enhanced fluid morphing with multiple frequencies
          const morphFactor =
            Math.sin(time * waveSpeed + theta * 3) * 0.3 +
            Math.cos(time * 0.5 + phi * 2) * 0.2 +
            Math.sin(time * 0.3 + theta * 2) * 0.15; // Added slower morphing

          const electricPulse =
            Math.sin(time * 2 + phi * 4) * 0.2 +
            Math.cos(time * 1.5 + theta * 3) * 0.15 +
            Math.sin(time * 0.8 + phi * 2) * 0.1; // Added gentler pulse

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
      context.shadowBlur = 20;
      context.shadowColor = `hsl(${(time * 50) % 360}, 100%, 50%)`; // Color-cycling glow

      for (let y = 0; y < SCREEN_HEIGHT; y++) {
        const line = output.slice(y * SCREEN_WIDTH, (y + 1) * SCREEN_WIDTH);
        for (let x = 0; x < SCREEN_WIDTH; x++) {
          const char = line[x];
          if (char !== " ") {
            const luminanceIndex = CHARS.indexOf(char);
            const colorIndex = Math.floor((luminanceIndex / CHARS.length) * COLORS.length);
            context.fillStyle = COLORS[Math.min(colorIndex, COLORS.length - 1)];
            context.fillText(char, startX + x * charSize, startY + (y + 1) * charSize);
          }
        }
      }

      // Varied rotation speeds with organic acceleration
      A += 0.003 * (1 + pulse * 0.2 + breathe * 0.15);
      B += 0.002 * (1 + secondaryPulse * 0.2 + breathe * 0.1);

      requestAnimationFrame(renderFrame);
    }

    renderFrame();

    return () => {
      window.removeEventListener("resize", updateCanvasSize);
    };
  }, []);

  return (
    <div className="w-full h-[100vh] flex items-center justify-center bg-[#000810] p-8">
      <canvas ref={canvasRef} className="bg-[#000810]" />
    </div>
  );
}
