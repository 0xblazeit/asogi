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

    // Enhanced color palette with electric blue accents
    const COLORS = [
      "#1a1a2e", // Dark blue
      "#16213e", // Navy blue
      "#0f3460", // Deep blue
      "#247ba0", // Medium blue
      "#70d6ff", // Light blue
      "#a2d2ff", // Very light blue
      "#e0fbfc", // Almost white blue
      "#00ffff", // Cyan
      "#80ffff", // Light cyan
    ];

    const CHARS = "⚡✧●◆△⬡*."; // More dynamic characters

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

      // Time-based wave effects
      const waveSpeed = 0.5;
      time += 0.016; // Approximately 60fps

      for (let theta = 0; theta < 2 * Math.PI; theta += 0.07) {
        const cosTheta = Math.cos(theta);
        const sinTheta = Math.sin(theta);

        for (let phi = 0; phi < 2 * Math.PI; phi += 0.02) {
          const cosPhi = Math.cos(phi);
          const sinPhi = Math.sin(phi);

          // Create morphing wave effects
          const morphFactor = Math.sin(time * waveSpeed + theta * 3) * 0.3;
          const electricPulse = Math.sin(time * 2 + phi * 4) * 0.2;

          // Dynamic radius with wave distortion
          const dynamicR1 = R1 * (1 + morphFactor);
          const dynamicR2 = R2 * (1 + electricPulse);

          // Create more organic, flowing shape
          const circleX = dynamicR2 + dynamicR1 * cosTheta * (1 + 0.2 * Math.sin(3 * phi + time));
          const circleY = dynamicR1 * sinTheta * (1 + 0.1 * Math.cos(2 * theta + time));

          // Add electric field effect
          const electricField = Math.sin(time * 3 + theta * 5) * Math.cos(phi * 3) * 0.15;

          // Enhanced 3D coordinates with electric field distortion
          const x = circleX * (cosB * cosPhi + sinA * sinB * sinPhi) - circleY * cosA * sinB + electricField;
          const y = circleX * (sinB * cosPhi - sinA * cosB * sinPhi) + circleY * cosA * cosB + electricField;
          const z = K2 + cosA * circleX * sinPhi + circleY * sinA;

          const ooz = 1 / z;
          const xp = Math.floor(SCREEN_WIDTH / 2 + K1 * ooz * x);
          const yp = Math.floor(SCREEN_HEIGHT / 2 - K1 * ooz * y);

          // Enhanced luminance calculation with electric effect
          const L =
            (cosPhi * cosTheta * sinB -
              cosA * cosTheta * sinPhi -
              sinA * sinTheta +
              cosB * (cosA * sinTheta - cosTheta * sinA * sinPhi)) *
            (1 + Math.abs(electricField));

          if (L > 0 && xp >= 0 && xp < SCREEN_WIDTH && yp >= 0 && yp < SCREEN_HEIGHT) {
            const pos = xp + yp * SCREEN_WIDTH;
            if (ooz > zbuffer[pos]) {
              zbuffer[pos] = ooz;
              // Add random electric sparks
              const spark = Math.random() > 0.99 ? CHARS[0] : CHARS[Math.floor(L * 8) % CHARS.length];
              output[pos] = spark;
            }
          }
        }
      }

      // Render to canvas
      context.fillStyle = "#000810"; // Dark blue background
      context.fillRect(0, 0, canvas.width, canvas.height);

      const charSize = Math.min(canvas.width / (SCREEN_WIDTH + 8), canvas.height / (SCREEN_HEIGHT + 8));
      context.font = `${charSize}px monospace`;

      const startX = (canvas.width - SCREEN_WIDTH * charSize) / 2;
      const startY = (canvas.height - SCREEN_HEIGHT * charSize) / 2;

      // Add glow effect
      context.shadowBlur = 15;
      context.shadowColor = "#00ffff";

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

      // Slower rotation
      A += 0.003;
      B += 0.002;

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
