"use client";
import { useEffect, useRef } from "react";

const easeOutQuart = (x) => 1 - Math.pow(1 - x, 4);
const easeInQuart = (x) => x * x * x * x;
const easeInOutQuart = (x) => (x < 0.5 ? 8 * x * x * x * x : 1 - Math.pow(-2 * x + 2, 4) / 2);

export default function RotatingObject({
  walletAddress = "0xcEB780385e065697369R33a07466403518D035fB",
  canvasRef: externalCanvasRef,
}) {
  // Generate a random Ethereum-like wallet address if no address is provided
  const randomWalletAddress = !walletAddress
    ? `0x${Array.from(crypto.getRandomValues(new Uint8Array(20)), (byte) => byte.toString(16).padStart(2, "0")).join(
        ""
      )}`
    : walletAddress;

  const internalCanvasRef = useRef(null);
  const canvasRef = externalCanvasRef || internalCanvasRef;

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d", { alpha: false }); // Optimize for non-transparent canvas

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
        morphIntensity: 0.8 + (parseInt(morphSegment, 16) / 16 ** 8) * 0.7,
        morphFrequency: 0.8 + parseInt(morphSegment.slice(0, 4), 16) / 16 ** 4,

        // Speed parameters
        speedFactor: 0.5 + parseInt(speedSegment, 16) / 16 ** 4,
        rotationDirection: parseInt(speedSegment.slice(0, 2), 16) % 2 === 0 ? 1 : -1,

        // Pattern parameters
        patternScale: 0.8 + parseInt(patternSegment, 16) / 16 ** 8,
        patternComplexity: 2 + (parseInt(patternSegment.slice(0, 4), 16) % 7),

        // Pulse parameters
        pulseIntensity: 0.3 + (parseInt(pulseSegment, 16) / 16 ** 6) * 0.7,
        pulseFrequency: 0.5 + parseInt(pulseSegment.slice(0, 3), 16) / 16 ** 3,

        // Glow parameters
        glowIntensity: 0.4 + (parseInt(glowSegment, 16) / 16 ** 6) * 0.6,
        glowRadius: 10 + (parseInt(glowSegment.slice(0, 3), 16) % 20),

        // Shape parameters
        shapeVariation: parseInt(shapeSegment, 16) / 16 ** 2,

        // Add new abstract parameters
        distortionFactor: 0.4 + (parseInt(glowSegment, 16) / 16 ** 6) * 0.8,
        noiseFrequency: 1.2 + parseInt(speedSegment.slice(0, 2), 16) / 16 ** 2,
      };
    };

    const uniqueParams = generateUniqueParams(randomWalletAddress);

    // Constants for shape geometry
    const R1 = 0.8;
    const R2 = 1.6;
    const K2 = 8;

    // Performance optimization constants
    const PERFORMANCE_CONFIG = {
      frameInterval: 1000 / 30, // Cap at 30 FPS
      thetaStep: 0.2, // Increased step size for more angular shapes
      phiStep: 0.2, // Increased step size for more angular shapes
      screenDivisor: 18, // Adjusted for larger ASCII characters
      skipFrames: 7, // Only process every nth frame for heavy calculations to reduce load. (lower screenDivisor = higher skipFrames : for better performance)
      currentFrame: 0, // Track the current frame number
      lastFrameTime: 0, // Track the time of the last frame
      useAdaptiveResolution: true, // Flag to enable adaptive resolution
    };

    // Color state management
    const colorState = {
      isMonochrome: false,
      monochromeHue: 0,
      transitionProgress: 0,
      lastTransition: 0,
      transitionDuration: 2000, // Duration of transition in milliseconds
      monochromeDuration: 5000, // How long to stay monochrome
      normalDuration: 8000, // How long to stay in normal color mode
    };

    // Burst animation constants
    const burstConfig = {
      timeBetweenBursts: 6000,
      burstChance: 0.6,
      maxProgress: 1.2,
      progressIncrement: 0.02,
    };

    // Base color palette generation
    const generateColorPalette = (baseHue, satOffset, forcedHue = null, monochromeIntensity = 0) => {
      const hue = forcedHue !== null ? forcedHue : baseHue;
      const complementaryHue = (hue + 180) % 360;
      const analogousHue1 = (hue + 30) % 360;
      const analogousHue2 = (hue - 30 + 360) % 360;
      const splitComplementaryHue1 = (complementaryHue + 30) % 360;
      const splitComplementaryHue2 = (complementaryHue - 30 + 360) % 360;

      // For monochrome mode, we adjust saturation and brightness
      const getSaturation = (baseSat) => {
        const normalSat = baseSat + satOffset;
        return monochromeIntensity > 0 ? normalSat * (1 - monochromeIntensity) + 70 * monochromeIntensity : normalSat;
      };

      const getHue = (targetHue) => {
        return monochromeIntensity > 0 ? hue : targetHue;
      };

      return {
        base: [
          `hsl(${getHue(hue)}, ${getSaturation(70)}%, ${15 + monochromeIntensity * 10}%)`,
          `hsl(${getHue(hue)}, ${getSaturation(80)}%, ${25 + monochromeIntensity * 15}%)`,
          `hsl(${getHue(hue)}, ${getSaturation(90)}%, ${35 + monochromeIntensity * 20}%)`,
        ],
        analogous: [
          `hsl(${getHue(analogousHue1)}, ${getSaturation(85)}%, ${45 + monochromeIntensity * 15}%)`,
          `hsl(${getHue(analogousHue2)}, ${getSaturation(85)}%, ${40 + monochromeIntensity * 20}%)`,
        ],
        complementary: [
          `hsl(${getHue(complementaryHue)}, ${getSaturation(100)}%, ${50 + monochromeIntensity * 15}%)`,
          `hsl(${getHue(splitComplementaryHue1)}, ${getSaturation(95)}%, ${55 + monochromeIntensity * 10}%)`,
          `hsl(${getHue(splitComplementaryHue2)}, ${getSaturation(95)}%, ${45 + monochromeIntensity * 20}%)`,
        ],
      };
    };

    // Initialize base colors
    let COLORS = uniqueParams
      ? generateColorPalette(uniqueParams.baseHue, uniqueParams.saturationOffset).base.concat(
          generateColorPalette(uniqueParams.baseHue, uniqueParams.saturationOffset).analogous,
          generateColorPalette(uniqueParams.baseHue, uniqueParams.saturationOffset).complementary
        )
      : [
          "#1a1a2e",
          "#16213e",
          "#0f3460",
          "#ff4e00",
          "#ff7f50",
          "#ff6b6b",
          "#ffd700",
          "#ff8c00",
          "#ff5252",
          "#ff3d00",
          "#ff1744",
        ];

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

    // Optimization: Pre-calculate expensive values
    const preCalculated = {
      sinValues: new Float32Array(Math.ceil((2 * Math.PI) / PERFORMANCE_CONFIG.thetaStep)),
      cosValues: new Float32Array(Math.ceil((2 * Math.PI) / PERFORMANCE_CONFIG.thetaStep)),
    };

    // Initialize preCalculated values
    for (let i = 0; i < preCalculated.sinValues.length; i++) {
      const angle = i * PERFORMANCE_CONFIG.thetaStep;
      preCalculated.sinValues[i] = Math.sin(angle);
      preCalculated.cosValues[i] = Math.cos(angle);
    }

    // Update the canvas size function
    const updateCanvasSize = () => {
      if (!canvas) return { permanentOutput: [], permanentZBuffer: new Float32Array() }; // Guard clause with return value

      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;

      // Adjust the screen dimensions based on the viewport
      const SCREEN_WIDTH = Math.max(10, Math.ceil(window.innerWidth / PERFORMANCE_CONFIG.screenDivisor));
      const SCREEN_HEIGHT = Math.max(10, Math.ceil(window.innerHeight / PERFORMANCE_CONFIG.screenDivisor));

      // Create new buffers with new dimensions
      const newSize = SCREEN_WIDTH * SCREEN_HEIGHT;
      const newOutput = new Array(newSize).fill(" ");
      const newZBuffer = new Float32Array(newSize);

      // Update preCalculated values if needed
      const newThetaLength = Math.ceil((2 * Math.PI) / PERFORMANCE_CONFIG.thetaStep);
      if (preCalculated.sinValues.length !== newThetaLength) {
        preCalculated.sinValues = new Float32Array(newThetaLength);
        preCalculated.cosValues = new Float32Array(newThetaLength);
        for (let i = 0; i < newThetaLength; i++) {
          const angle = i * PERFORMANCE_CONFIG.thetaStep;
          preCalculated.sinValues[i] = Math.sin(angle);
          preCalculated.cosValues[i] = Math.cos(angle);
        }
      }

      return {
        permanentOutput: newOutput,
        permanentZBuffer: newZBuffer,
      };
    };

    // Initial setup
    let { permanentOutput, permanentZBuffer } = updateCanvasSize();

    // Add resize listener
    window.addEventListener("resize", () => {
      const newBuffers = updateCanvasSize();
      permanentOutput = newBuffers.permanentOutput;
      permanentZBuffer = newBuffers.permanentZBuffer;
    });

    // Add breathing effect base frequency
    let breathePhase = 0;

    // Update bright versions with even more intense warm colors
    const BRIGHT_COLORS = [
      "#4a4a8e",
      "#4661ae",
      "#3f84d0",
      "#ff7b00",
      "#ff9e40",
      "#ffac41",
      "#ffcc00",
      "#ff8c00",
      "#ff5252",
      "#ff3d00",
      "#ff1744",
    ];

    const CHAR_SETS = [
      // Celestial and Mystical
      "✧●◆△⬡*.✦★", // Original celestial set
      "⚝✴✺✵✶✷✸✹✻", // Mystical set
      "✣✤✥✦✧✪✫✬✭", // Extended celestial
      "⭑⭒⭓⭔✯✰⁂", // Stars variation

      // Geometric Patterns
      "■□▢▣▤▥▦▧▨", // Geometric set
      "▰▱▲▼◀▶◢◣", // Filled shapes
      "◰◱◲◳◴◵◶◷", // Partial circles
      "⬒⬓⬔⬕⬖⬗⬘⬙", // Diamond patterns
      "◢◣◤◥◸◹◺◿", // Triangular patterns
      "⯀⯁⯂⯃⯄⯅⯆⯇⯈", // Modern geometric

      // Circles and Dots
      "○●◐◑◒◓◔◕◌", // Minimal circles
      "⊕⊖⊗⊘⊙⊚⊛⊜⊝", // Circled operators
      "⊹⊺⊻⊼⊽⋄⋆⋇⋈", // Circle variations
      "⚬⚭⚮⚯⚲⚳⚴", // Astronomical

      // Nature and Decorative
      "❋✿❀❃✾✤✣✢❉", // Nature/floral set
      "❧❦☙✾❀❁❂❃❇", // Floral variations
      "⚘⚵⚶⚷⚸⚹⚺⚻⚼", // Decorative symbols
      "❄❅❆❇❈❉❊❋", // Winter patterns

      // Box Drawing - Basic
      "┌┐└┘├┤┬┴┼", // Basic box corners
      "═║╔╗╚╝╠╣╦╩", // Double line box
      "╭╮╯╰│─┆┊┋", // Rounded corners
      "┏┓┗┛┣┫┳┻╋", // Bold corners

      // Box Drawing - Advanced
      "╱╲╳┼╋╂┿╀╁", // Diagonal patterns
      "┠┨┯┷┿╂╅╈", // Mixed weight lines
      "╄╅╆╇╈╉╊╋", // Complex intersections
      "┏╍┓┇┗╍┛┇", // Mixed style borders

      // Block Elements
      "▀▄█▌▐░▒▓■", // Block elements
      "▁▂▃▄▅▆▇█", // Gradient blocks
      "░▒▓█▇▆▅▄", // Shading patterns
      "▛▜▝▞▟▙▚▌▐", // Block combinations

      // Technical and Special
      "⌘⌙⌤⌥⌡⌠⌢⌣", // Technical symbols
      "⏣⏤⏥⏦⌬⌭⌮⌯", // Control symbols
      "⟡⟢⟣⟤⟥⟦⟧⟨⟩", // Mathematical
      "⧀⧁⧂⧃⧄⧅⧆⧇⧈", // Technical variations

      // Modern Box Patterns
      "╋╪╬╭╮╯╰╱╲", // Ornate intersections
      "┏┳┓┣╋┫┗┻┛", // Heavy box drawings
      "╒╤╕╞╪╡╘╧╛", // Mixed single-double
      "⯐⯑⯒⯓⯔⯕⯖⯗⯘", // Contemporary boxes

      // ASCII Art - Basic
      "+-|*/\\[](){}", // Basic ASCII elements
      "<>^v/\\|_-~", // Directional ASCII
      ".,;:!?*#@$", // Punctuation patterns
      "()[]{}><||", // Bracket patterns

      // ASCII Art - Complex
      "|/-\\|/-\\|", // Spinning patterns
      ".-*-.-*-.", // Dotted patterns
      "=^.^==^.^=", // Face patterns
      ":;:;:;:;:", // Rhythm patterns

      // ASCII Borders
      "+-++--++--", // Border variations
      "|\\/|\\/|\\/|", // Zigzag patterns
      "[]{}()><><", // Container patterns
      "//\\\\//\\\\//", // Diagonal patterns

      // ASCII Geometric
      "/_\\|-|/_\\|", // Geometric shapes
      "|^|v|^|v|^", // Up-down patterns
      "<>><>><>>", // Arrow patterns
      "/|\\|-|/|\\|", // Triangle patterns

      // ASCII Decorative
      ".o0Oo.o0Oo", // Bubble patterns
      "-=≡=-=≡=-", // Equal patterns
      "~-^-~-^-~", // Wave patterns
      "`'`'`'`'`", // Quote patterns

      // ASCII Technical
      "+|-+|-+|-+", // Circuit patterns
      "}{}{}{}{}", // Brace patterns
      "/-\\|-/-\\|", // Path patterns
      "|=|=|=|=|", // Equal line patterns

      // ASCII Minimal
      ".,;:.,;:.", // Dot patterns
      "-_=-_=-_=", // Underscore patterns
      "~-~-~-~-~", // Tilde patterns
      '`.,"\'`.,"', // Quote mix patterns

      // ASCII Complex
      "|\\^/|\\^/|", // Mountain patterns
      "<|>v<|>v<", // Arrow combinations
      "[|]=[|]=[", // Box combinations
      "/=\\|/=\\|/", // Roof patterns,

      // Simple Directional Arrows
      "←→↔↕↖↗↘↙↑↓", // Basic directions
      "⇐⇒⇔⇕⇖⇗⇘⇙⇑⇓", // Double arrows
      "↜↝↢↣↤↥↦↧↨↩", // Flow arrows
      "↪↫↬↭↮↯↰↱↲↳", // Movement arrows

      // Process Flow Arrows
      "⇄⇅⇆⇇⇈⇉⇊⇋⇌⇍", // Bidirectional
      "⇎⇏⇐⇑⇒⇓⇔⇕⇖", // Logic flow
      "⇗⇘⇙⇚⇛⇜⇝⇞⇟", // Process flow
      "⇠⇡⇢⇣⇤⇥⇦⇧⇨", // Terminal flow

      // Circular Motion
      "↴↵↶↷↺↻⇀⇁⇂⇃", // Rotation set
      "⇄⇅↜↭↝⇆⇇⇈⇉⇊", // Cycle arrows
      "↫↬↩↪⇜⇝⇦⇧⇨⇩", // Return flows
      "↰↱↲↳↴↵↶↷↸↹", // Corner turns

      // Specialized Arrows
      "↖↗↘↙⇖⇗⇘⇙⇪↨", // Diagonal set
      "↼↽↾↿⇀⇁⇂⇃⇋⇌", // Hook arrows
      "⇍⇎⇏⇐⇑⇒⇓⇔⇕", // Logic symbols
      "⇤⇥⇦⇧⇨⇩⇪↨↕↔", // Terminal marks

      // Rounded Box Corners
      "╭╮╯╰╱╲╳╴╵╶", // Basic rounded corners
      "╭─╮│╰─╯│╭╮", // Simple box
      "╱╲╳╭╮╯╰──│", // Mixed angles
      "╭━╮┃╰━╯┃╭╮", // Bold rounded box

      // Rounded Box Patterns
      "╭╮╯╰╱╲╳╱╲╳", // Corner mix
      "╭─╮╱╰─╯╲╭╮", // Slashed box
      "╱╲╳╭╮╯╰╱╲╳", // Angular mix
      "╭╮╯╰│─╭╮╯╰", // Clean corners

      // Rounded Box Combinations
      "╭╮╱╲╯╰╳╴╵╶", // Mixed elements
      "╱╲╭╮╯╰╱╲╳╳", // Diagonal mix
      "╭─╮╲╰─╯╱╭╮", // Stylized box
      "╱╲╳╮╯╰╭╱╲╳", // Dynamic angles

      // Block Elements Basic
      "▐░▒▓▔▕▖▗▘▙", // Basic blocks
      "▚▛▜▝▞▟░▒▓█", // Mixed blocks
      "▌▐▀▄█▖▗▘▙▚", // Solid blocks
      "▛▜▝▞▟▁▂▃▄▅", // Gradient blocks

      // Shading Patterns
      "░▒▓█▓▒░ ░▒", // Gradient fade
      "▖▗▘▙▚▛▜▝▞▟", // Quarter blocks
      "▌▐▀▄░▒▓█▓▒", // Mixed shading
      "▔▕▖▗▘▙▚▛▜▝", // Thin blocks

      // Block Combinations
      "█▀▄▌▐░▒▓▔▕", // Mixed weights
      "▖▗▘▙▚▛▜▝▞▟", // Quarter patterns
      "▌▐▜▛▞▟▙▚▜▛", // Corner blocks
      "░▒▓█▓▒░█▓▒", // Gradient mix

      // Advanced Block Patterns
      "▀▄█▌▐▖▗▘▙▚", // Complex blocks
      "▛▜▝▞▟░▒▓█▓", // Progressive fill
      "▗▘▙▚▛▜▝▞▟▖", // Rotating quarters
      "▔▕▖▗▘▙▚▛▜▝", // Thin variations
    ];

    const CHARS = CHAR_SETS[Math.floor(Math.random() * CHAR_SETS.length)];

    // Modify the OSCILLATION_SPOTS configuration for warmer colors
    const OSCILLATION_SPOTS = Array(5)
      .fill(0)
      .map(() => ({
        theta: Math.random() * 2 * Math.PI,
        phi: Math.random() * 2 * Math.PI,
        radius: 0.15 + Math.random() * 0.2,
        frequency: 0.8 + Math.random() * 2.5,
        amplitude: 0.4 + Math.random() * 0.6,
        lifetime: 0,
        maxLifetime: 80 + Math.random() * 160,
        color: 20 + Math.random() * 40,
        intensity: 0.9 + Math.random() * 0.3,
      }));

    // Add this function before renderFrame
    const updateOscillationSpots = () => {
      OSCILLATION_SPOTS.forEach((spot) => {
        spot.lifetime += 1;
        if (spot.lifetime > spot.maxLifetime) {
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
        speed: 0.008 + Math.random() * 0.008,
        width: 0.15 + Math.random() * 0.2,
        intensity: 0.8 + Math.random() * 0.4,
        maxRadius: 1.8 + Math.random() * 1.2,
        active: true,
        color: 15 + Math.random() * 45,
        trailLength: 0.3 + Math.random() * 0.2,
        pulseFreq: 1 + Math.random() * 2,
      }));

    // Add this new function to detect edge proximity
    const calculateEdgeProximity = (x, y, radius) => {
      const baseRadius = (R1 + R2) / 2;
      const distanceFromBase = Math.abs(radius - baseRadius);
      return Math.exp(-Math.pow(distanceFromBase / 0.1, 2));
    };

    // Modify the calculateEnergyStreamEffect function
    const calculateEnergyStreamEffect = (theta, radius) => {
      let effect = {
        intensity: 0,
        colorShift: 0,
        distortion: 0,
        edgeGlow: 0,
      };

      const edgeProximity = calculateEdgeProximity(theta, radius);
      effect.edgeGlow = edgeProximity * 0.5;

      ENERGY_STREAMS.forEach((stream) => {
        if (!stream.active) return;

        let angleDiff = Math.abs(theta - stream.theta);
        angleDiff = Math.min(angleDiff, 2 * Math.PI - angleDiff);

        const streamRadius =
          stream.phase <= 1 ? stream.maxRadius * stream.phase : stream.maxRadius * (2 - stream.phase);

        const trailStart = Math.max(0, streamRadius - stream.trailLength);
        const trailEnd = streamRadius;

        if (radius >= trailStart && radius <= trailEnd) {
          const trailPosition = (radius - trailStart) / (trailEnd - trailStart);
          const trailEffect = Math.sin(trailPosition * Math.PI);

          const angularInfluence = Math.exp(-Math.pow(angleDiff / stream.width, 2));
          const streamEffect = trailEffect * angularInfluence * stream.intensity;

          effect.intensity += streamEffect;
          effect.colorShift += streamEffect * Math.sin((stream.color * Math.PI) / 180);

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
        radius: 0.1 + Math.random() * 0.15,
        intensity: 0.8 + Math.random() * 0.2,
        pulseSpeed: 0.5 + Math.random() * 1.5,
        warmColor: ["#FF4500", "#FF6B35", "#FF8C42", "#FFB347", "#FF7F50"][Math.floor(Math.random() * 5)],
        lifetime: 0,
        maxLifetime: 150 + Math.random() * 100,
      }));

    // Add this function before renderFrame
    const updateHeatSpots = () => {
      HEAT_SPOTS.forEach((spot) => {
        spot.lifetime += 1;
        if (spot.lifetime > spot.maxLifetime) {
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
      cooldownPeriod: 8000,
      shrinkFactor: 0.9,
    };

    // Add these helper functions before renderFrame
    const updateConcentrationState = (time) => {
      const currentTime = Date.now();

      if (
        !CONCENTRATION_STATE.active &&
        currentTime - CONCENTRATION_STATE.lastTrigger > CONCENTRATION_STATE.cooldownPeriod &&
        Math.random() < 0.005
      ) {
        CONCENTRATION_STATE.active = true;
        CONCENTRATION_STATE.progress = 0;
        CONCENTRATION_STATE.duration = 0;
        CONCENTRATION_STATE.maxDuration = 240;
        CONCENTRATION_STATE.centerTheta = Math.random() * 2 * Math.PI;
        CONCENTRATION_STATE.centerPhi = Math.random() * 2 * Math.PI;
        CONCENTRATION_STATE.intensity = 1.2 + Math.random() * 0.3;
        CONCENTRATION_STATE.pulseFrequency = 2 + Math.random() * 2;
        CONCENTRATION_STATE.lastTrigger = currentTime;
        CONCENTRATION_STATE.shrinkFactor = 0.85 + Math.random() * 0.1;
      }

      if (CONCENTRATION_STATE.active) {
        CONCENTRATION_STATE.duration++;

        const totalDuration = CONCENTRATION_STATE.maxDuration;
        const shrinkDuration = totalDuration * 0.3;
        const holdDuration = totalDuration * 0.4;
        const growDuration = totalDuration * 0.3;

        if (CONCENTRATION_STATE.duration < shrinkDuration) {
          const t = CONCENTRATION_STATE.duration / shrinkDuration;
          CONCENTRATION_STATE.progress = easeInQuart(t);
        } else if (CONCENTRATION_STATE.duration < shrinkDuration + holdDuration) {
          CONCENTRATION_STATE.progress = 1;
        } else if (CONCENTRATION_STATE.duration < totalDuration) {
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
      const maxRadius = 0.3 - CONCENTRATION_STATE.progress * 0.2;

      if (distance < maxRadius) {
        const falloff = Math.pow(1 - distance / maxRadius, 3);
        const pulse = Math.sin(time * CONCENTRATION_STATE.pulseFrequency) * 0.7 + 0.3;
        return falloff * CONCENTRATION_STATE.intensity * CONCENTRATION_STATE.progress * pulse;
      }

      return 0;
    };

    // Add split state configuration after CONCENTRATION_STATE
    const SPLIT_STATE = {
      active: false,
      progress: 0,
      splitDistance: 0,
      splitAngle: 0,
      fusionProgress: 0,
      splitDuration: 160,
      fusionDuration: 120,
      cooldownPeriod: 4000,
      lastTrigger: 0,
      splitIntensity: 0,
      energyBridgeIntensity: 0,
      maxSplitDistance: 1.8,
      splitWidth: Math.PI / 2,
      leftRotation: 0,
      rightRotation: 0,
      scaleFactorDuringSpilt: 0.85,
    };

    // Add split state update function before renderFrame
    const updateSplitState = (time) => {
      const currentTime = Date.now();

      if (
        !SPLIT_STATE.active &&
        currentTime - SPLIT_STATE.lastTrigger > SPLIT_STATE.cooldownPeriod &&
        Math.random() < 0.01
      ) {
        SPLIT_STATE.active = true;
        SPLIT_STATE.progress = 0;
        SPLIT_STATE.splitDistance = 0;
        SPLIT_STATE.splitAngle = Math.random() * Math.PI * 2;
        SPLIT_STATE.fusionProgress = 0;
        SPLIT_STATE.lastTrigger = currentTime;
        SPLIT_STATE.splitIntensity = 0;
        SPLIT_STATE.energyBridgeIntensity = 0;
        SPLIT_STATE.leftRotation = 0;
        SPLIT_STATE.rightRotation = 0;
      }

      if (SPLIT_STATE.active) {
        if (SPLIT_STATE.progress < SPLIT_STATE.splitDuration) {
          SPLIT_STATE.progress++;
          const splitPhase = SPLIT_STATE.progress / SPLIT_STATE.splitDuration;

          const easedPhase = splitPhase < 0.4 ? easeInOutQuart(splitPhase / 0.4) : splitPhase > 0.6 ? 1.0 : 1.0;

          SPLIT_STATE.splitDistance = easedPhase * SPLIT_STATE.maxSplitDistance;
          SPLIT_STATE.splitIntensity = Math.min(1.0, splitPhase * 1.5);
          SPLIT_STATE.energyBridgeIntensity = Math.sin(splitPhase * Math.PI * 2);

          SPLIT_STATE.leftRotation = splitPhase * Math.PI * 0.12;
          SPLIT_STATE.rightRotation = -splitPhase * Math.PI * 0.12;
        } else if (SPLIT_STATE.progress < SPLIT_STATE.splitDuration + SPLIT_STATE.fusionDuration) {
          SPLIT_STATE.fusionProgress = (SPLIT_STATE.progress - SPLIT_STATE.splitDuration) / SPLIT_STATE.fusionDuration;
          const fusionEase = easeInOutQuart(SPLIT_STATE.fusionProgress);
          SPLIT_STATE.splitDistance = (1 - fusionEase) * SPLIT_STATE.maxSplitDistance;
          SPLIT_STATE.splitIntensity = 1 - SPLIT_STATE.fusionProgress;
          SPLIT_STATE.energyBridgeIntensity = Math.sin(SPLIT_STATE.fusionProgress * Math.PI * 3);

          SPLIT_STATE.leftRotation = (1 - fusionEase) * Math.PI * 0.12;
          SPLIT_STATE.rightRotation = -(1 - fusionEase) * Math.PI * 0.12;
          SPLIT_STATE.progress++;
        } else {
          SPLIT_STATE.active = false;
        }
      }
    };

    // Add split effect calculation function
    const calculateSplitEffect = (theta, phi, radius) => {
      if (!SPLIT_STATE.active) return { offset: 0, intensity: 0, rotation: 0, scale: 1.0 };

      const angleFromSplit = Math.abs(normalizeAngle(theta - SPLIT_STATE.splitAngle));
      const isLeftSide = normalizeAngle(theta - SPLIT_STATE.splitAngle) < 0;

      const splitFactor = angleFromSplit < SPLIT_STATE.splitWidth ? 1.0 : 0.0;

      const rotation = isLeftSide ? SPLIT_STATE.leftRotation : SPLIT_STATE.rightRotation;

      const bridgeEffect =
        SPLIT_STATE.energyBridgeIntensity *
        Math.exp(-Math.pow(angleFromSplit / (Math.PI / 6), 2)) *
        Math.sin(phi * 10 + time * 4) *
        Math.sin(theta * 12 + time * 5);

      const scaleFactor = SPLIT_STATE.active
        ? SPLIT_STATE.scaleFactorDuringSpilt +
          (1 - SPLIT_STATE.scaleFactorDuringSpilt) * (1 - SPLIT_STATE.splitIntensity)
        : 1.0;

      return {
        offset: SPLIT_STATE.splitDistance * splitFactor,
        intensity: SPLIT_STATE.splitIntensity * splitFactor + bridgeEffect * 2.0,
        rotation: rotation * splitFactor,
        scale: scaleFactor,
      };
    };

    // Add angle normalization helper
    function normalizeAngle(angle) {
      while (angle > Math.PI) angle -= 2 * Math.PI;
      while (angle < -Math.PI) angle += 2 * Math.PI;
      return angle;
    }

    // Add these new state variables after SPLIT_STATE
    const DEPTH_LAYER = {
      rotation: 0,
      speed: 0.003,
      amplitude: 0.4,
      frequency: 1.2,
      depthScale: 0.8,
      zOffset: 2.5, // Controls how far "behind" the main shape this layer appears
      independentTime: 0,
    };

    const renderFrame = () => {
      const now = Date.now();
      const elapsed = now - PERFORMANCE_CONFIG.lastFrameTime;

      // Skip frame if we're running too fast
      if (elapsed < PERFORMANCE_CONFIG.frameInterval) {
        requestAnimationFrame(renderFrame);
        return;
      }

      PERFORMANCE_CONFIG.lastFrameTime = now - (elapsed % PERFORMANCE_CONFIG.frameInterval);
      PERFORMANCE_CONFIG.currentFrame++;

      const SCREEN_WIDTH = Math.ceil(window.innerWidth / PERFORMANCE_CONFIG.screenDivisor);
      const SCREEN_HEIGHT = Math.ceil(window.innerHeight / PERFORMANCE_CONFIG.screenDivisor);
      const K1 = (Math.min(SCREEN_WIDTH, SCREEN_HEIGHT) * K2 * 3) / (8 * (R1 + R2));

      // Clear buffers efficiently
      permanentOutput.fill(" ");
      permanentZBuffer.fill(0);

      // Only update color states and other expensive calculations every few frames
      if (PERFORMANCE_CONFIG.currentFrame % PERFORMANCE_CONFIG.skipFrames === 0) {
        const timeSinceLastTransition = now - colorState.lastTransition;
        const timeSinceLastBurst = now - lastBurstTime;

        // Color mode transitions
        if (!colorState.isMonochrome && timeSinceLastTransition > colorState.normalDuration) {
          colorState.isMonochrome = true;
          colorState.lastTransition = now;
          colorState.monochromeHue = Math.random() * 360;
        } else if (colorState.isMonochrome && timeSinceLastTransition > colorState.monochromeDuration) {
          colorState.isMonochrome = false;
          colorState.lastTransition = now;
        }

        // Update color palette
        if (uniqueParams) {
          const monochromeIntensity = colorState.isMonochrome
            ? Math.min(1, ((now - colorState.lastTransition) / colorState.transitionDuration) * 1.5)
            : Math.max(0, 1 - ((now - colorState.lastTransition) / colorState.transitionDuration) * 1.5);

          const currentPalette = generateColorPalette(
            uniqueParams.baseHue,
            uniqueParams.saturationOffset,
            colorState.isMonochrome ? colorState.monochromeHue : null,
            monochromeIntensity
          );

          COLORS.length = 0;
          COLORS.push(...currentPalette.base, ...currentPalette.analogous, ...currentPalette.complementary);

          const dynamicHue1 = colorState.isMonochrome
            ? colorState.monochromeHue
            : (uniqueParams.baseHue + time * 30) % 360;
          const dynamicHue2 = colorState.isMonochrome
            ? colorState.monochromeHue
            : (uniqueParams.baseHue + 180 + time * 30) % 360;

          COLORS.push(
            `hsl(${dynamicHue1}, ${colorState.isMonochrome ? 70 : 100}%, ${
              60 + (colorState.isMonochrome ? monochromeIntensity * 15 : 0)
            }%)`,
            `hsl(${dynamicHue2}, ${colorState.isMonochrome ? 70 : 100}%, ${
              55 + (colorState.isMonochrome ? monochromeIntensity * 20 : 0)
            }%)`
          );
        }
      }

      const cosA = Math.cos(A),
        sinA = Math.sin(A);
      const cosB = Math.cos(B),
        sinB = Math.sin(B);

      const waveSpeed = 1.2;
      time += 0.02;
      breathePhase += 0.015 * uniqueParams.pulseFrequency;

      const breathe = Math.sin(breathePhase) * 0.3 * uniqueParams.pulseIntensity;
      const pulse = Math.sin(time * 1.5) * 0.3 + Math.sin(time * 0.7) * 0.2 + Math.sin(time * 0.3) * 0.1;

      const secondaryPulse = Math.cos(time * 0.7) * 0.2 + Math.cos(time * 1.2) * 0.15 + Math.cos(time * 0.4) * 0.1;

      updateOscillationSpots();

      updateHeatSpots();

      updateConcentrationState(time);

      updateSplitState(time);

      // Update depth layer rotation independently
      DEPTH_LAYER.independentTime += 0.02;
      DEPTH_LAYER.rotation += DEPTH_LAYER.speed;

      // Create independent rotation matrices for depth layer
      const depthCosA = Math.cos(DEPTH_LAYER.rotation);
      const depthSinA = Math.sin(DEPTH_LAYER.rotation);
      const depthCosB = Math.cos(DEPTH_LAYER.rotation * 0.7);
      const depthSinB = Math.sin(DEPTH_LAYER.rotation * 0.7);

      const thetaMax = 2 * Math.PI;
      const phiMax = Math.PI;
      const thetaStep = PERFORMANCE_CONFIG.thetaStep;
      const phiStep = PERFORMANCE_CONFIG.phiStep;

      for (let thetaIndex = 0; thetaIndex < preCalculated.sinValues.length; thetaIndex++) {
        const cosTheta = preCalculated.cosValues[thetaIndex];
        const sinTheta = preCalculated.sinValues[thetaIndex];

        for (let phi = 0; phi < phiMax; phi += phiStep) {
          const cosPhi = Math.cos(phi);
          const sinPhi = Math.sin(phi);

          const radius = Math.sqrt(
            Math.pow(cosTheta * cosPhi, 2) + Math.pow(sinTheta * cosPhi, 2) + Math.pow(sinPhi, 2)
          );

          const sizeMultiplier =
            1 +
            OSCILLATION_SPOTS.reduce((acc, spot) => {
              const distanceTheta = Math.min(
                Math.abs(thetaIndex * PERFORMANCE_CONFIG.thetaStep - spot.theta),
                Math.abs(thetaIndex * PERFORMANCE_CONFIG.thetaStep - spot.theta + 2 * Math.PI),
                Math.abs(thetaIndex * PERFORMANCE_CONFIG.thetaStep - spot.theta - 2 * Math.PI)
              );
              const distancePhi = Math.min(
                Math.abs(phi - spot.phi),
                Math.abs(phi - spot.phi + 2 * Math.PI),
                Math.abs(phi - spot.phi - 2 * Math.PI)
              );

              const distance = Math.sqrt(distanceTheta * distanceTheta + distancePhi * distancePhi);

              if (distance < spot.radius) {
                const falloff = Math.pow(1 - distance / spot.radius, 2);
                const oscillation = Math.sin(time * spot.frequency) * spot.amplitude;
                const lifetimeFactor = Math.pow(1 - spot.lifetime / spot.maxLifetime, 1.5);

                const pulseIntensity = 1 + Math.sin(time * 2 + distance * 8) * 0.3;

                return acc + oscillation * falloff * lifetimeFactor * pulseIntensity * spot.intensity;
              }
              return acc;
            }, 0);

          const concentrationEffect = getConcentrationEffect(thetaIndex * PERFORMANCE_CONFIG.thetaStep, phi, radius);
          const morphFactor =
            (Math.sin(time * waveSpeed * dynamicSpeed.base + thetaIndex * PERFORMANCE_CONFIG.thetaStep * 3) * 0.4 +
              Math.cos(time * 0.7 * dynamicSpeed.pulse + phi * 2) * 0.3 +
              Math.sin(time * 0.5 * dynamicSpeed.twist + thetaIndex * PERFORMANCE_CONFIG.thetaStep * 2) * 0.25) *
              (1 - concentrationEffect) +
            concentrationEffect * Math.sin(time * 4 + thetaIndex * PERFORMANCE_CONFIG.thetaStep * 8) * 0.8;

          const electricPulse =
            Math.sin(time * 2.5 * dynamicSpeed.base + phi * 4) * 0.25 +
            Math.cos(time * 1.8 * dynamicSpeed.pulse + thetaIndex * PERFORMANCE_CONFIG.thetaStep * 3) * 0.2 +
            Math.sin(time * 1.2 * dynamicSpeed.twist + phi * 2) * 0.15;

          const spiralEffect =
            Math.sin(thetaIndex * PERFORMANCE_CONFIG.thetaStep * 5 + time * 2) * 0.15 +
            Math.cos(phi * 4 + time * 1.5) * 0.1 +
            Math.sin(thetaIndex * PERFORMANCE_CONFIG.thetaStep * 3 + time * 0.7) * 0.08;

          const vortexEffect =
            Math.cos(phi * 3 + time) * 0.2 +
            Math.sin(thetaIndex * PERFORMANCE_CONFIG.thetaStep * 4 + time * 1.2) * 0.15 +
            Math.cos(phi * 2 + time * 0.6) * 0.1;

          const twistEffect =
            Math.sin(thetaIndex * PERFORMANCE_CONFIG.thetaStep * 2 + phi * 2 + time * 1.5) * 0.2 +
            Math.cos(thetaIndex * PERFORMANCE_CONFIG.thetaStep * 3 + phi * 3 + time * 0.8) * 0.15 +
            breathe * Math.sin(thetaIndex * PERFORMANCE_CONFIG.thetaStep + phi) * 0.2;

          const concentrationShrink = CONCENTRATION_STATE.active
            ? 0.1 + (1 - easeInOutQuart(CONCENTRATION_STATE.progress) * CONCENTRATION_STATE.shrinkFactor) * 0.9
            : 1;
          const dynamicR1 = R1 * (1 + morphFactor + pulse + spiralEffect + twistEffect + breathe) * concentrationShrink;
          const dynamicR2 =
            R2 * (1 + electricPulse + secondaryPulse + vortexEffect + breathe * 0.5) * concentrationShrink;

          const shapeDeform =
            uniqueParams.shapeVariation *
            (Math.sin(thetaIndex * PERFORMANCE_CONFIG.thetaStep * uniqueParams.patternComplexity + time) +
              Math.cos(phi * uniqueParams.patternComplexity + time * 0.7) * 0.8);

          const circleX = (dynamicR2 + dynamicR1 * cosTheta * (1 + 0.3 * Math.sin(3 * phi + time))) * (1 + shapeDeform);

          const circleY =
            dynamicR1 *
            sinTheta *
            (1 + 0.2 * Math.cos(2 * thetaIndex * PERFORMANCE_CONFIG.thetaStep + time)) *
            (1 + shapeDeform);

          const electricField =
            Math.sin(time * 3 + thetaIndex * PERFORMANCE_CONFIG.thetaStep * 5) * Math.cos(phi * 3) * 0.2 +
            Math.cos(time * 2 + phi * 4) * Math.sin(thetaIndex * PERFORMANCE_CONFIG.thetaStep * 3) * 0.15 +
            Math.sin(time * 1.5 + thetaIndex * PERFORMANCE_CONFIG.thetaStep * 2 + phi * 2) * 0.1;

          const x = circleX * (cosB * cosPhi + sinA * sinB * sinPhi) - circleY * cosA * sinB + electricField;
          const y = circleX * (sinB * cosPhi - sinA * cosB * sinPhi) + circleY * cosA * cosB + electricField;
          const z = K2 + cosA * circleX * sinPhi + circleY * sinA;

          const splitEffect = calculateSplitEffect(thetaIndex * PERFORMANCE_CONFIG.thetaStep, phi, radius);

          const scaledX = x * splitEffect.scale;
          const scaledY = y * splitEffect.scale;

          const rotatedX = scaledX * Math.cos(splitEffect.rotation) - scaledY * Math.sin(splitEffect.rotation);
          const rotatedY = scaledX * Math.sin(splitEffect.rotation) + scaledY * Math.cos(splitEffect.rotation);

          const xSplit = rotatedX + Math.cos(SPLIT_STATE.splitAngle) * splitEffect.offset * 1.5;
          const ySplit = rotatedY + Math.sin(SPLIT_STATE.splitAngle) * splitEffect.offset * 1.5;

          const zSplit = z * splitEffect.scale + splitEffect.intensity * Math.sin(phi * 5 + time * 4) * 0.4;

          // Calculate depth layer coordinates
          const depthMorphFactor =
            Math.sin(
              DEPTH_LAYER.independentTime * DEPTH_LAYER.frequency + thetaIndex * PERFORMANCE_CONFIG.thetaStep * 2
            ) * DEPTH_LAYER.amplitude;

          const depthR1 = R1 * DEPTH_LAYER.depthScale * (1 + depthMorphFactor);
          const depthR2 = R2 * DEPTH_LAYER.depthScale * (1 + depthMorphFactor * 0.5);

          const depthCircleX = depthR2 + depthR1 * cosTheta;
          const depthCircleY = depthR1 * sinTheta;

          const depthX =
            depthCircleX * (depthCosB * cosPhi + depthSinA * depthSinB * sinPhi) -
            depthCircleY * Math.cos(DEPTH_LAYER.rotation) * depthSinB;
          const depthY =
            depthCircleX * (depthSinB * cosPhi - depthSinA * depthCosB * sinPhi) +
            depthCircleY * Math.cos(DEPTH_LAYER.rotation) * depthCosB;
          const depthZ =
            K2 +
            DEPTH_LAYER.zOffset +
            Math.cos(DEPTH_LAYER.rotation) * depthCircleX * sinPhi +
            depthCircleY * Math.sin(DEPTH_LAYER.rotation);

          // Combine main layer and depth layer
          const combinedX = xSplit;
          const combinedY = ySplit;
          const combinedZ = Math.min(zSplit, depthZ); // Use smaller Z value to handle overlapping

          // Update projection calculations with combined coordinates
          const ooz = 1 / combinedZ;
          const xp = Math.floor(SCREEN_WIDTH / 2 + K1 * ooz * combinedX);
          const yp = Math.floor(SCREEN_HEIGHT / 2 - K1 * ooz * combinedY);

          // Calculate main shape luminance
          const L =
            (cosPhi * cosTheta * sinB -
              cosA * cosTheta * sinPhi -
              sinA * sinTheta +
              cosB * (cosA * sinTheta - cosTheta * sinA * sinPhi)) *
            0.7;

          // Calculate depth layer luminance
          const depthL =
            (cosPhi * cosTheta * depthSinB -
              Math.cos(DEPTH_LAYER.rotation) * cosTheta * sinPhi -
              Math.sin(DEPTH_LAYER.rotation) * sinTheta +
              depthCosB *
                (Math.cos(DEPTH_LAYER.rotation) * sinTheta - cosTheta * Math.sin(DEPTH_LAYER.rotation) * sinPhi)) *
            0.7;

          const combinedL = Math.max(L, depthL);

          if (combinedL > 0 && xp >= 0 && xp < SCREEN_WIDTH && yp >= 0 && yp < SCREEN_HEIGHT) {
            const pos = xp + yp * SCREEN_WIDTH;
            if (ooz > permanentZBuffer[pos]) {
              permanentZBuffer[pos] = ooz;
              const sparkChance = Math.random();
              let char;
              if (sparkChance > 0.99) {
                char = CHARS[0];
              } else if (sparkChance > 0.95) {
                char = CHARS[CHARS.length - 1];
              } else {
                char = CHARS[Math.floor((combinedL * 8 + time) % (CHARS.length - 2)) + 1];
              }
              permanentOutput[pos] = char;
            }
          }
        }
      }

      context.fillStyle = "#000810";
      context.fillRect(0, 0, canvas.width, canvas.height);

      const charSize = Math.min((canvas.width + 32) / SCREEN_WIDTH, (canvas.height + 32) / SCREEN_HEIGHT);
      context.font = `${charSize}px monospace`;

      const startX = (canvas.width - SCREEN_WIDTH * charSize) / 2 - charSize;
      const startY = (canvas.height - SCREEN_HEIGHT * charSize) / 2 - charSize;

      if (SPLIT_STATE.active) {
        const splitGlowIntensity = SPLIT_STATE.splitIntensity * 3;
        context.shadowBlur = uniqueParams.glowRadius * (1 + splitGlowIntensity);
        context.shadowColor = `hsl(${(time * 90) % 360}, 100%, ${75 + splitGlowIntensity * 20}%)`;
      }

      for (let y = 0; y < SCREEN_HEIGHT; y++) {
        const line = permanentOutput.slice(y * SCREEN_WIDTH, (y + 1) * SCREEN_WIDTH);
        for (let x = 0; x < SCREEN_WIDTH; x++) {
          const char = line[x];
          if (char !== " ") {
            const luminanceIndex = CHARS.indexOf(char);
            let colorIndex = Math.floor((luminanceIndex / CHARS.length) * COLORS.length);

            const relX = x - SCREEN_WIDTH / 2;
            const relY = y - SCREEN_HEIGHT / 2;
            const radius = Math.sqrt(relX * relX + relY * relY) / SCREEN_WIDTH;
            const theta = Math.atan2(relY, relX);

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
              const baseColor = HEAT_SPOTS[0].warmColor;
              const intensity = Math.min(1, heatSpotEffect * 1.5);
              context.shadowBlur = 15 + intensity * 25;
              context.shadowColor = baseColor;
              context.fillStyle = baseColor;
            } else {
              context.fillStyle = COLORS[colorIndex];
            }

            context.fillText(char, startX + x * charSize, startY + (y + 1) * charSize);
          }
        }
      }

      context.shadowBlur = 20;
      context.shadowColor = `hsl(${(time * 50) % 360}, 100%, 50%)`;

      A += 0.005 * uniqueParams.speedFactor * uniqueParams.rotationDirection;
      B += 0.004 * uniqueParams.speedFactor * uniqueParams.rotationDirection;

      requestAnimationFrame(renderFrame);
    };

    renderFrame();

    return () => {
      window.removeEventListener("resize", updateCanvasSize);
    };
  }, [randomWalletAddress]);

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
    <div className="absolute z-[-1] inset-0 bg-[#000810]">
      <canvas ref={canvasRef} className="w-full h-full" />
    </div>
  );
}
