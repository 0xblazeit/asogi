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

    // Update the color palettes with more vibrant warm colors
    const COLORS = [
      "#1a1a2e",
      "#16213e",
      "#0f3460",
      "#ff4e00", // Bright orange
      "#ff7f50", // Coral
      "#ff6b6b", // Warm red
      "#ffd700", // Gold
      "#ff8c00", // Dark orange
      "#ff5722", // Deep orange
      "#ff3d00", // Bright orange-red
      "#ff1744", // Vibrant red
    ];

    // Update bright versions with even more intense warm colors
    const BRIGHT_COLORS = [
      "#4a4a8e",
      "#4661ae",
      "#3f84d0",
      "#ff7b00", // Brighter orange
      "#ff9e40", // Light orange
      "#ffac41", // Warm gold
      "#ffcc00", // Bright yellow
      "#ff9100", // Vivid orange
      "#ff5252", // Bright red
      "#ff3d00", // Intense orange
      "#ff1744", // Vibrant red
    ];

    const CHARS = "✧●◆△⬡*.✦★"; // Added more varied characters

    // Modify the OSCILLATION_SPOTS configuration for warmer colors
    const OSCILLATION_SPOTS = Array(5)
      .fill(0)
      .map(() => ({
        theta: Math.random() * 2 * Math.PI,
        phi: Math.random() * 2 * Math.PI,
        radius: 0.15 + Math.random() * 0.2, // Smaller radius for more focused effect
        frequency: 0.8 + Math.random() * 2.5, // Faster oscillations
        amplitude: 0.4 + Math.random() * 0.6, // Stronger amplitude
        lifetime: 0,
        maxLifetime: 80 + Math.random() * 160, // Shorter lifetime for more dynamic changes
        color: 20 + Math.random() * 40, // Hue range between orange-red (20) and yellow-orange (60)
        intensity: 0.9 + Math.random() * 0.3, // Increased intensity
      }));

    // Add this function before renderFrame
    const updateOscillationSpots = () => {
      OSCILLATION_SPOTS.forEach((spot) => {
        spot.lifetime += 1;
        if (spot.lifetime > spot.maxLifetime) {
          // Relocate the oscillation spot
          spot.theta = Math.random() * 2 * Math.PI;
          spot.phi = Math.random() * 2 * Math.PI;
          spot.radius = 0.2 + Math.random() * 0.3;
          spot.frequency = 0.5 + Math.random() * 2;
          spot.amplitude = 0.2 + Math.random() * 0.4;
          spot.lifetime = 0;
          spot.maxLifetime = 100 + Math.random() * 200;
        }
      });
    };

    // First, let's modify the ENERGY_STREAMS configuration for more edge-focused effects
    const ENERGY_STREAMS = Array(5)
      .fill(0)
      .map(() => ({
        theta: Math.random() * 2 * Math.PI,
        phase: 0,
        speed: 0.008 + Math.random() * 0.008, // Slightly slower for more visible streams
        width: 0.15 + Math.random() * 0.2, // Thinner streams
        intensity: 0.8 + Math.random() * 0.4, // Increased intensity
        maxRadius: 1.8 + Math.random() * 1.2, // Shorter reach for more frequent interactions
        active: true,
        color: 15 + Math.random() * 45, // Hue range focused on orange spectrum
        trailLength: 0.3 + Math.random() * 0.2, // New: controls the length of the energy trail
        pulseFreq: 1 + Math.random() * 2, // New: individual pulse frequency
      }));

    // Add this new function to detect edge proximity
    const calculateEdgeProximity = (x, y, radius) => {
      const baseRadius = (R1 + R2) / 2;
      const distanceFromBase = Math.abs(radius - baseRadius);
      return Math.exp(-Math.pow(distanceFromBase / 0.1, 2)); // Sharp falloff for edge detection
    };

    // Modify the calculateEnergyStreamEffect function
    const calculateEnergyStreamEffect = (theta, radius) => {
      let effect = {
        intensity: 0,
        colorShift: 0,
        distortion: 0,
        edgeGlow: 0, // New: specific edge glow effect
      };

      // Add edge proximity calculation
      const edgeProximity = calculateEdgeProximity(theta, radius);
      effect.edgeGlow = edgeProximity * 0.5;

      ENERGY_STREAMS.forEach((stream) => {
        if (!stream.active) return;

        let angleDiff = Math.abs(theta - stream.theta);
        angleDiff = Math.min(angleDiff, 2 * Math.PI - angleDiff);

        // Calculate stream position with trail effect
        const streamRadius =
          stream.phase <= 1 ? stream.maxRadius * stream.phase : stream.maxRadius * (2 - stream.phase);

        // Add trail effect
        const trailStart = Math.max(0, streamRadius - stream.trailLength);
        const trailEnd = streamRadius;

        // Check if point is within the trail
        if (radius >= trailStart && radius <= trailEnd) {
          const trailPosition = (radius - trailStart) / (trailEnd - trailStart);
          const trailEffect = Math.sin(trailPosition * Math.PI);

          const angularInfluence = Math.exp(-Math.pow(angleDiff / stream.width, 2));
          const streamEffect = trailEffect * angularInfluence * stream.intensity;

          effect.intensity += streamEffect;
          effect.colorShift += streamEffect * Math.sin((stream.color * Math.PI) / 180);

          // Add pulsing effect on the edge
          if (edgeProximity > 0.5) {
            const pulseWave = Math.sin(time * stream.pulseFreq + theta * 2);
            effect.distortion += streamEffect * pulseWave * edgeProximity * 0.3;
          }
        }
      });

      return effect;
    };

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

      // Update oscillation spots
      updateOscillationSpots();

      for (let theta = 0; theta < 2 * Math.PI; theta += 0.06) {
        const cosTheta = Math.cos(theta);
        const sinTheta = Math.sin(theta);

        for (let phi = 0; phi < 2 * Math.PI; phi += 0.015) {
          const cosPhi = Math.cos(phi);
          const sinPhi = Math.sin(phi);

          // Calculate influence from nearby oscillation spots
          const sizeMultiplier =
            1 +
            OSCILLATION_SPOTS.reduce((acc, spot) => {
              const distanceTheta = Math.min(
                Math.abs(theta - spot.theta),
                Math.abs(theta - spot.theta + 2 * Math.PI),
                Math.abs(theta - spot.theta - 2 * Math.PI)
              );
              const distancePhi = Math.min(
                Math.abs(phi - spot.phi),
                Math.abs(phi - spot.phi + 2 * Math.PI),
                Math.abs(phi - spot.phi - 2 * Math.PI)
              );

              const distance = Math.sqrt(distanceTheta * distanceTheta + distancePhi * distancePhi);

              if (distance < spot.radius) {
                const falloff = Math.pow(1 - distance / spot.radius, 2); // Sharper falloff
                const oscillation = Math.sin(time * spot.frequency) * spot.amplitude;
                const lifetimeFactor = Math.pow(1 - spot.lifetime / spot.maxLifetime, 1.5);

                // Add pulsing intensity
                const pulseIntensity = 1 + Math.sin(time * 2 + distance * 8) * 0.3;

                return acc + oscillation * falloff * lifetimeFactor * pulseIntensity * spot.intensity;
              }
              return acc;
            }, 0);

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
            (dynamicR2 + dynamicR1 * cosTheta * (1 + 0.3 * Math.sin(3 * phi + time))) * sizeMultiplier +
            0.2 * Math.sin(theta * 4 + time * 1.5) +
            0.15 * Math.cos(phi * 5 + time * 0.8) +
            0.1 * Math.sin(theta * 2 + phi * 2 + time * 0.5); // Added interweaving pattern

          const circleY =
            dynamicR1 * sinTheta * (1 + 0.2 * Math.cos(2 * theta + time)) * sizeMultiplier +
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
            let colorIndex = Math.floor((luminanceIndex / CHARS.length) * COLORS.length);

            // Calculate position and effects
            const relX = x - SCREEN_WIDTH / 2;
            const relY = y - SCREEN_HEIGHT / 2;
            const radius = Math.sqrt(relX * relX + relY * relY) / SCREEN_WIDTH;
            const theta = Math.atan2(relY, relX);

            const energyEffect = calculateEnergyStreamEffect(theta, radius);

            // Calculate oscillation spot color influence
            const spotEffect = OSCILLATION_SPOTS.reduce(
              (acc, spot) => {
                const distanceTheta = Math.min(
                  Math.abs(theta - spot.theta),
                  Math.abs(theta - spot.theta + 2 * Math.PI),
                  Math.abs(theta - spot.theta - 2 * Math.PI)
                );
                const distance = Math.sqrt(distanceTheta * distanceTheta);

                if (distance < spot.radius) {
                  const falloff = Math.pow(1 - distance / spot.radius, 2);
                  return {
                    intensity: acc.intensity + falloff * spot.intensity,
                    hue: acc.hue + spot.color * falloff,
                    weight: acc.weight + falloff,
                  };
                }
                return acc;
              },
              { intensity: 0, hue: 0, weight: 0 }
            );

            // Enhanced edge glow effect
            const edgeGlow = energyEffect.edgeGlow * (1 + Math.sin(time * 2 + theta * 3) * 0.3);
            context.shadowBlur = 20 + energyEffect.intensity * 15 + edgeGlow * 20 + spotEffect.intensity * 25;

            if (energyEffect.intensity > 0.1 || edgeGlow > 0.3 || spotEffect.intensity > 0.1) {
              const baseHue = (time * 30 + energyEffect.colorShift * 60) % 360; // Slower color cycle
              const spotHue = spotEffect.weight > 0 ? spotEffect.hue / spotEffect.weight : 30; // Default to orange
              const finalHue = spotEffect.intensity > 0.3 ? spotHue : baseHue;

              const saturation = 100;
              // Increase lightness for more vibrant appearance
              const lightness = 55 + energyEffect.intensity * 35 + edgeGlow * 25 + spotEffect.intensity * 45;

              // Add more warmth to the glow
              const energyColor = `hsl(${finalHue}, ${saturation}%, ${lightness}%)`;
              const edgeColor = `hsl(${(finalHue + 15) % 360}, ${saturation}%, ${Math.min(lightness + 10, 100)}%)`;

              // Increase glow intensity for focused areas
              context.shadowBlur = 25 + energyEffect.intensity * 20 + edgeGlow * 25 + spotEffect.intensity * 30;

              context.shadowColor = edgeGlow > 0.3 ? edgeColor : energyColor;
              context.fillStyle = energyColor;
            } else {
              context.fillStyle = COLORS[colorIndex];
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
