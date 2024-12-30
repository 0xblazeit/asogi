"use client";
import { useEffect, useRef } from "react";

const easeOutQuart = (x) => 1 - Math.pow(1 - x, 4);
const easeInQuart = (x) => x * x * x * x;
const easeInOutQuart = (x) => (x < 0.5 ? 8 * x * x * x * x : 1 - Math.pow(-2 * x + 2, 4) / 2);

export default function RotatingObject({ walletAddress = "" }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    // Generate unique parameters from wallet address
    const generateUniqueParams = (address) => {
      if (!address) return null;

      // Break the 42-character address (minus '0x') into segments
      const colorSegment = address.slice(2, 8); // 6 chars: base colors
      const morphSegment = address.slice(8, 16); // 8 chars: morphing behavior
      const speedSegment = address.slice(16, 20); // 4 chars: animation speed
      const patternSegment = address.slice(20, 28); // 8 chars: pattern complexity
      const pulseSegment = address.slice(28, 34); // 6 chars: pulsing effects
      const glowSegment = address.slice(34, 40); // 6 chars: glow intensity
      const shapeSegment = address.slice(40, 42); // 2 chars: shape variation

      return {
        // Color parameters
        baseHue: parseInt(colorSegment, 16) % 360,
        saturationOffset: parseInt(colorSegment.slice(0, 2), 16) % 50,

        // Morphing parameters
        morphIntensity: 0.5 + (parseInt(morphSegment, 16) / 16 ** 8) * 0.5,
        morphFrequency: 0.5 + parseInt(morphSegment.slice(0, 4), 16) / 16 ** 4,

        // Speed parameters
        speedFactor: 0.5 + parseInt(speedSegment, 16) / 16 ** 4,
        rotationDirection: parseInt(speedSegment.slice(0, 2), 16) % 2 === 0 ? 1 : -1,

        // Pattern parameters
        patternScale: 0.5 + parseInt(patternSegment, 16) / 16 ** 8,
        patternComplexity: 1 + (parseInt(patternSegment.slice(0, 4), 16) % 5),

        // Pulse parameters
        pulseIntensity: 0.3 + (parseInt(pulseSegment, 16) / 16 ** 6) * 0.7,
        pulseFrequency: 0.5 + parseInt(pulseSegment.slice(0, 3), 16) / 16 ** 3,

        // Glow parameters
        glowIntensity: 0.4 + (parseInt(glowSegment, 16) / 16 ** 6) * 0.6,
        glowRadius: 10 + (parseInt(glowSegment.slice(0, 3), 16) % 20),

        // Shape parameters
        shapeVariation: parseInt(shapeSegment, 16) / 16 ** 2,
      };
    };

    const uniqueParams = generateUniqueParams(walletAddress);

    // Modify color palettes based on wallet address
    const COLORS = uniqueParams
      ? [
          `hsl(${uniqueParams.baseHue}, ${70 + uniqueParams.saturationOffset}%, 15%)`,
          `hsl(${uniqueParams.baseHue}, ${80 + uniqueParams.saturationOffset}%, 25%)`,
          `hsl(${uniqueParams.baseHue}, ${90 + uniqueParams.saturationOffset}%, 35%)`,
          `hsl(${(uniqueParams.baseHue + 30) % 360}, 100%, 50%)`,
          `hsl(${(uniqueParams.baseHue + 60) % 360}, 100%, 55%)`,
          `hsl(${(uniqueParams.baseHue + 90) % 360}, 100%, 60%)`,
        ]
      : [
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
      base: (1 + Math.sin(time * 0.5) * 0.3) * uniqueParams.speedFactor,
      pulse:
        Math.sin(time * 2 * uniqueParams.pulseFrequency) * 0.4 + Math.cos(time * uniqueParams.pulseFrequency) * 0.3,
      twist: Math.cos(time * 1.5) * 0.5 * uniqueParams.morphIntensity,
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
    };

    // Initial setup
    updateCanvasSize();
    window.addEventListener("resize", updateCanvasSize);

    // Add breathing effect base frequency
    let breathePhase = 0;

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

    // Add this new constant after CHARS definition
    const HEAT_SPOTS = Array(3)
      .fill(0)
      .map(() => ({
        theta: Math.random() * 2 * Math.PI,
        phi: Math.random() * 2 * Math.PI,
        radius: 0.1 + Math.random() * 0.15, // Small concentrated areas
        intensity: 0.8 + Math.random() * 0.2,
        pulseSpeed: 0.5 + Math.random() * 1.5,
        warmColor: [
          "#FF4500", // Orange Red
          "#FF6B35", // Burning Orange
          "#FF8C42", // Deep Orange
          "#FFB347", // Light Orange
          "#FF7F50", // Coral
        ][Math.floor(Math.random() * 5)],
        lifetime: 0,
        maxLifetime: 150 + Math.random() * 100,
      }));

    // Add this function before renderFrame
    const updateHeatSpots = () => {
      HEAT_SPOTS.forEach((spot) => {
        spot.lifetime += 1;
        if (spot.lifetime > spot.maxLifetime) {
          // Relocate the heat spot
          spot.theta = Math.random() * 2 * Math.PI;
          spot.phi = Math.random() * 2 * Math.PI;
          spot.radius = 0.1 + Math.random() * 0.15;
          spot.lifetime = 0;
          spot.maxLifetime = 150 + Math.random() * 100;
          spot.warmColor = ["#FF4500", "#FF6B35", "#FF8C42", "#FFB347", "#FF7F50"][Math.floor(Math.random() * 5)];
        }
      });
    };

    // Add this new configuration after HEAT_SPOTS
    const CONCENTRATION_STATE = {
      active: false,
      progress: 0,
      duration: 0,
      maxDuration: 0,
      centerTheta: 0,
      centerPhi: 0,
      intensity: 0,
      pulseFrequency: 0,
      lastTrigger: 0,
      cooldownPeriod: 8000, // Increased from 2000 to 8 seconds
      shrinkFactor: 0.9,
    };

    // Add these helper functions before renderFrame
    const updateConcentrationState = (time) => {
      const currentTime = Date.now();

      if (
        !CONCENTRATION_STATE.active &&
        currentTime - CONCENTRATION_STATE.lastTrigger > CONCENTRATION_STATE.cooldownPeriod &&
        Math.random() < 0.005 // Decreased from 0.05 to 0.005 (0.5% chance per frame)
      ) {
        CONCENTRATION_STATE.active = true;
        CONCENTRATION_STATE.progress = 0;
        CONCENTRATION_STATE.duration = 0;
        CONCENTRATION_STATE.maxDuration = 240; // Fixed duration for smoother timing
        CONCENTRATION_STATE.centerTheta = Math.random() * 2 * Math.PI;
        CONCENTRATION_STATE.centerPhi = Math.random() * 2 * Math.PI;
        CONCENTRATION_STATE.intensity = 1.2 + Math.random() * 0.3;
        CONCENTRATION_STATE.pulseFrequency = 2 + Math.random() * 2;
        CONCENTRATION_STATE.lastTrigger = currentTime;
        CONCENTRATION_STATE.shrinkFactor = 0.85 + Math.random() * 0.1;
      }

      if (CONCENTRATION_STATE.active) {
        CONCENTRATION_STATE.duration++;

        // Smoother transition using phases
        const totalDuration = CONCENTRATION_STATE.maxDuration;
        const shrinkDuration = totalDuration * 0.3; // 30% of total time
        const holdDuration = totalDuration * 0.4; // 40% of total time
        const growDuration = totalDuration * 0.3; // 30% of total time

        if (CONCENTRATION_STATE.duration < shrinkDuration) {
          // Shrinking phase
          const t = CONCENTRATION_STATE.duration / shrinkDuration;
          CONCENTRATION_STATE.progress = easeInQuart(t);
        } else if (CONCENTRATION_STATE.duration < shrinkDuration + holdDuration) {
          // Hold phase
          CONCENTRATION_STATE.progress = 1;
        } else if (CONCENTRATION_STATE.duration < totalDuration) {
          // Growing phase
          const t = (CONCENTRATION_STATE.duration - (shrinkDuration + holdDuration)) / growDuration;
          CONCENTRATION_STATE.progress = 1 - easeOutQuart(t);
        } else {
          CONCENTRATION_STATE.active = false;
        }
      }
    };

    const getConcentrationEffect = (theta, phi, radius) => {
      if (!CONCENTRATION_STATE.active) return 0;

      const distanceTheta = Math.min(
        Math.abs(theta - CONCENTRATION_STATE.centerTheta),
        Math.abs(theta - CONCENTRATION_STATE.centerTheta + 2 * Math.PI),
        Math.abs(theta - CONCENTRATION_STATE.centerTheta - 2 * Math.PI)
      );

      const distancePhi = Math.min(
        Math.abs(phi - CONCENTRATION_STATE.centerPhi),
        Math.abs(phi - CONCENTRATION_STATE.centerPhi + 2 * Math.PI),
        Math.abs(phi - CONCENTRATION_STATE.centerPhi - 2 * Math.PI)
      );

      const distance = Math.sqrt(distanceTheta * distanceTheta + distancePhi * distancePhi);
      // Much smaller maxRadius during concentration
      const maxRadius = 0.3 - CONCENTRATION_STATE.progress * 0.2; // Reduced from 0.8 to 0.3

      if (distance < maxRadius) {
        const falloff = Math.pow(1 - distance / maxRadius, 3); // Sharper falloff (changed from 2 to 3)
        const pulse = Math.sin(time * CONCENTRATION_STATE.pulseFrequency) * 0.7 + 0.3; // Stronger pulse
        return falloff * CONCENTRATION_STATE.intensity * CONCENTRATION_STATE.progress * pulse;
      }

      return 0;
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
      breathePhase += 0.015 * uniqueParams.pulseFrequency;

      // Complex organic pulsing with multiple harmonics
      const breathe = Math.sin(breathePhase) * 0.3 * uniqueParams.pulseIntensity;
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

      // Add this function before renderFrame
      updateHeatSpots();

      updateConcentrationState(time);

      for (let theta = 0; theta < 2 * Math.PI; theta += 0.06) {
        const cosTheta = Math.cos(theta);
        const sinTheta = Math.sin(theta);

        for (let phi = 0; phi < 2 * Math.PI; phi += 0.015) {
          const cosPhi = Math.cos(phi);
          const sinPhi = Math.sin(phi);

          // Calculate radius for the current position
          const radius = Math.sqrt(
            Math.pow(cosTheta * cosPhi, 2) + Math.pow(sinTheta * cosPhi, 2) + Math.pow(sinPhi, 2)
          );

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

          // Modify the morphFactor calculation to include concentration effect
          const concentrationEffect = getConcentrationEffect(theta, phi, radius);
          const morphFactor =
            (Math.sin(time * waveSpeed * dynamicSpeed.base + theta * 3) * 0.4 +
              Math.cos(time * 0.7 * dynamicSpeed.pulse + phi * 2) * 0.3 +
              Math.sin(time * 0.5 * dynamicSpeed.twist + theta * 2) * 0.25) *
              (1 - concentrationEffect) + // Reduce normal morphing during concentration
            concentrationEffect * Math.sin(time * 4 + theta * 8) * 0.8; // Add intense pulsing during concentration

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

          // Modify the dynamicR1 and dynamicR2 calculations
          const concentrationShrink = CONCENTRATION_STATE.active
            ? 0.1 + (1 - easeInOutQuart(CONCENTRATION_STATE.progress) * CONCENTRATION_STATE.shrinkFactor) * 0.9
            : 1;
          const dynamicR1 = R1 * (1 + morphFactor + pulse + spiralEffect + twistEffect + breathe) * concentrationShrink;
          const dynamicR2 =
            R2 * (1 + electricPulse + secondaryPulse + vortexEffect + breathe * 0.5) * concentrationShrink;

          // More fluid shape deformation
          const shapeDeform = uniqueParams.shapeVariation * Math.sin(theta * uniqueParams.patternComplexity + time);

          const circleX = (dynamicR2 + dynamicR1 * cosTheta * (1 + 0.3 * Math.sin(3 * phi + time))) * (1 + shapeDeform);

          const circleY = dynamicR1 * sinTheta * (1 + 0.2 * Math.cos(2 * theta + time)) * (1 + shapeDeform);

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
      context.shadowBlur = uniqueParams.glowRadius + Math.sin(time * 3) * 5 * uniqueParams.glowIntensity;
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

            // Check if point is within any heat spot
            const heatSpotEffect = HEAT_SPOTS.reduce((acc, spot) => {
              const distanceTheta = Math.min(
                Math.abs(theta - spot.theta),
                Math.abs(theta - spot.theta + 2 * Math.PI),
                Math.abs(theta - spot.theta - 2 * Math.PI)
              );
              const distancePhi = Math.abs(radius - spot.radius);
              const distance = Math.sqrt(distanceTheta * distanceTheta + distancePhi * distancePhi);

              if (distance < spot.radius) {
                const intensity = Math.pow(1 - distance / spot.radius, 2) * spot.intensity;
                const pulse = (1 + Math.sin(time * spot.pulseSpeed)) * 0.5;
                return Math.max(acc, intensity * pulse);
              }
              return acc;
            }, 0);

            if (heatSpotEffect > 0.1) {
              // Apply warm color with intensity
              const baseColor = HEAT_SPOTS[0].warmColor;
              const intensity = Math.min(1, heatSpotEffect * 1.5);
              context.shadowBlur = 15 + intensity * 25;
              context.shadowColor = baseColor;
              context.fillStyle = baseColor;
            } else {
              // Use original color scheme
              context.fillStyle = COLORS[colorIndex];
            }

            context.fillText(char, startX + x * charSize, startY + (y + 1) * charSize);
          }
        }
      }

      // Reset shadow properties for next frame
      context.shadowBlur = 20;
      context.shadowColor = `hsl(${(time * 50) % 360}, 100%, 50%)`;

      A += 0.005 * uniqueParams.speedFactor * uniqueParams.rotationDirection;
      B += 0.004 * uniqueParams.speedFactor * uniqueParams.rotationDirection;

      requestAnimationFrame(renderFrame);
    }

    renderFrame();

    return () => {
      window.removeEventListener("resize", updateCanvasSize);
    };
  }, [walletAddress]);

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
