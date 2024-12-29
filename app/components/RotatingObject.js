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

    // Increase screen height to show full potato
    const SCREEN_WIDTH = 50; // Reduced for better visibility
    const SCREEN_HEIGHT = 50; // Made square to ensure full visibility
    const R1 = 0.5;
    const R2 = 1.0;
    const K2 = 10; // Moved further back
    const K1 = (SCREEN_WIDTH * K2 * 3) / (8 * (R1 + R2));

    // ASCII brightness map (from darkest to brightest)
    const CHARS = "@$#*!=;:~-,."; // Reversed order for better color mapping

    // Color palette from dark to bright
    const COLORS = [
      "#3d2817", // Dark brown
      "#5c3a21", // Brown
      "#6f4a2c", // Light brown
      "#8b5e34", // Tan
      "#a67744", // Light tan
      "#c18e50", // Golden brown
      "#d4a35d", // Light golden
      "#e8b96a", // Pale golden
      "#f7d994", // Very light golden
    ];

    // Buffers for the ASCII output and Z-buffer
    let output = new Array(SCREEN_WIDTH * SCREEN_HEIGHT).fill(" ");
    let zbuffer = new Array(SCREEN_WIDTH * SCREEN_HEIGHT).fill(0);

    let A = 0,
      B = 0; // Rotation angles

    function renderFrame() {
      // Clear buffers
      output.fill(" ");
      zbuffer.fill(0);

      // Precompute trigonometric values
      const cosA = Math.cos(A),
        sinA = Math.sin(A);
      const cosB = Math.cos(B),
        sinB = Math.sin(B);

      // Iterate over the potato surface
      for (let theta = 0; theta < 2 * Math.PI; theta += 0.07) {
        const cosTheta = Math.cos(theta);
        const sinTheta = Math.sin(theta);

        for (let phi = 0; phi < 2 * Math.PI; phi += 0.02) {
          const cosPhi = Math.cos(phi);
          const sinPhi = Math.sin(phi);

          // Create slightly irregular shape for potato effect
          const circleX = R2 + R1 * cosTheta * (1 + 0.2 * Math.sin(3 * phi));
          const circleY = R1 * sinTheta * (1 + 0.1 * Math.cos(2 * theta));

          // 3D coordinates after rotation
          const x = circleX * (cosB * cosPhi + sinA * sinB * sinPhi) - circleY * cosA * sinB;
          const y = circleX * (sinB * cosPhi - sinA * cosB * sinPhi) + circleY * cosA * cosB;
          const z = K2 + cosA * circleX * sinPhi + circleY * sinA;

          // Calculate 2D projection
          const ooz = 1 / z; // "one over z"
          const xp = Math.floor(SCREEN_WIDTH / 2 + K1 * ooz * x);
          const yp = Math.floor(SCREEN_HEIGHT / 2 - K1 * ooz * y);

          // Calculate luminance
          const L =
            cosPhi * cosTheta * sinB -
            cosA * cosTheta * sinPhi -
            sinA * sinTheta +
            cosB * (cosA * sinTheta - cosTheta * sinA * sinPhi);

          // Only render visible surfaces
          if (L > 0 && xp >= 0 && xp < SCREEN_WIDTH && yp >= 0 && yp < SCREEN_HEIGHT) {
            const pos = xp + yp * SCREEN_WIDTH;
            if (ooz > zbuffer[pos]) {
              zbuffer[pos] = ooz;
              const luminanceIndex = Math.floor(L * 8);
              output[pos] = CHARS[Math.min(luminanceIndex, CHARS.length - 1)];
            }
          }
        }
      }

      // Render to canvas
      context.fillStyle = "black";
      context.fillRect(0, 0, canvas.width, canvas.height);

      // Calculate character size based on canvas dimensions
      const charSize = Math.min(canvas.width / (SCREEN_WIDTH + 8), canvas.height / (SCREEN_HEIGHT + 8));

      context.font = `${charSize}px monospace`;

      // Center the potato in the canvas
      const startX = (canvas.width - SCREEN_WIDTH * charSize) / 2;
      const startY = (canvas.height - SCREEN_HEIGHT * charSize) / 2;

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

      // Update rotation angles
      A += 0.005;
      B += 0.003;

      requestAnimationFrame(renderFrame);
    }

    renderFrame();

    return () => {
      window.removeEventListener("resize", updateCanvasSize);
    };
  }, []);

  return (
    <div className="w-full h-[100vh] flex items-center justify-center bg-black p-8">
      <canvas ref={canvasRef} className="bg-black" />
    </div>
  );
}
