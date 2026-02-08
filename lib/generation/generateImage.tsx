// lib/cat-generation/generateImage.tsx

import { IPhysicalTraits } from "../../models/CatAliens";

// =============================================================================
// CONSTANTS
// =============================================================================

const BODY_CONFIG = {
  centerX: 100,
  centerY: 95,
  baseRadius: 50,
  pointCount: 16,
  pointCountVariation: 4,
  radiusVariation: 0.15,
  curveControlPointFactor: 0.3,
} as const;

const TAIL_CONFIG = {
  singleTailOriginX: 150,
  singleTailOriginY: 80,
  multiTailOriginX: 140,
  multiTailOriginY: 100,
  angleSpreadDegrees: 60,
  defaultAngle: 30,
  strokeWidth: 4,
  strokeWidthVariation: 1,
  baseOpacity: 0.7,
  opacityVariation: 0.1,
} as const;

const LEG_CONFIG = {
  width: 6,
  height: 30,
  borderRadius: 3,
  fullOpacity: 1,
} as const;

const WING_CONFIG = {
  polygonPoints: "0,-15 -8,0 8,0",
  verticalOffset: -20,
  baseOpacity: 0.6,
  opacityVariation: 0.1,
} as const;

const EYE_CONFIG = {
  gridColumns: 4,
  columnSpacing: 12,
  rowSpacing: 15,
  baseX: 65,
  baseY: 80,
  baseRadius: 3,
  collisionRetryX: 80,
  collisionRetryY: 90,
  maxCollisionAttempts: 10,
  collisionRadiusFactor: 0.8,
  fillColor: "white",
} as const;

const COLOR_THEORY = {
  complementaryHueShift: 180,
  analogousHueShifts: [-30, -60, 30],
  triadicHueShifts: [120, 240, 160],
  fallbackHueVariation: 25,
  fallbackSaturationVariationFactor: 0.5,
} as const;

const CURVE_ANGLES = {
  topStart: Math.PI * 1.25,
  topEnd: Math.PI * 1.75,
  bottomStart: Math.PI * -20,
  bottomEnd: Math.PI * 0.9,
} as const;

// =============================================================================
// TYPE GUARDS & VALIDATION
// =============================================================================

function isValidHexColor(hex: string): boolean {
  return /^#[0-9A-Fa-f]{6}$/.test(hex);
}

function validateTraits(traits: IPhysicalTraits): void {
  if (!isValidHexColor(traits.colour)) {
    throw new Error(`Invalid hex color: ${traits.colour}`);
  }
  if (traits.eyes < 0 || traits.legs < 0 || traits.tails < 0 || traits.wings < 0) {
    throw new Error("Trait counts must be non-negative");
  }
}

// =============================================================================
// MATH UTILITIES
// =============================================================================

/**
 * Generates a deterministic pseudo-random number between 0 and 1 based on a seed.
 * Uses sine function for distribution.
 */
function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

/**
 * Adds random variation to a base value using a seeded random generator.
 * @param base - The base value to vary
 * @param seed - Seed for deterministic randomness
 * @param amount - Maximum variation amount (default: 3)
 * @returns The jittered value
 */
function jitter(base: number, seed: number, amount: number = 3): number {
  return base + (seededRandom(seed) - 0.5) * amount * 2;
}

// =============================================================================
// COLOR THEORY UTILITIES
// =============================================================================

/**
 * Converts a hex color to HSL color space.
 * @param hex - Hex color string (e.g., "#FF5733")
 * @returns Tuple of [hue (0-360), saturation (0-100), lightness (0-100)]
 */
function hexToHsl(hex: string): [number, number, number] {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  let h = 0;
  let s = 0;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  return [h * 360, s * 100, l * 100];
}

/**
 * Converts HSL color to hex format.
 * @param h - Hue (0-360)
 * @param s - Saturation (0-100)
 * @param l - Lightness (0-100)
 * @returns Hex color string
 */
function hslToHex(h: number, s: number, l: number): string {
  h = h / 360;
  s = s / 100;
  l = l / 100;

  let r: number, g: number, b: number;

  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number): number => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  const toHex = (x: number): string => {
    const hex = Math.round(x * 255).toString(16);
    return hex.length === 1 ? "0" + hex : hex;
  };

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

/**
 * Generates a complementary color (opposite on color wheel).
 */
function getComplementaryColor(hex: string, jitterAmount: number = 0): string {
  const [h, s, l] = hexToHsl(hex);
  const newH = (h + COLOR_THEORY.complementaryHueShift + jitterAmount) % 360;
  return hslToHex(newH, s, l);
}

/**
 * Generates three analogous colors (adjacent on color wheel).
 */
function getAnalogousColors(hex: string): [string, string, string] {
  const [h, s, l] = hexToHsl(hex);
  return [
    hslToHex((h + COLOR_THEORY.analogousHueShifts[0] + 360) % 360, s, l),
    hslToHex((h + COLOR_THEORY.analogousHueShifts[1] + 360) % 360, s, l),
    hslToHex((h + COLOR_THEORY.analogousHueShifts[2]) % 360, s, l),
  ];
}

/**
 * Generates three triadic colors (evenly spaced on color wheel).
 */
function getTriadicColors(hex: string): [string, string, string] {
  const [h, s, l] = hexToHsl(hex);
  return [
    hslToHex((h + COLOR_THEORY.triadicHueShifts[0]) % 360, s, l),
    hslToHex((h + COLOR_THEORY.triadicHueShifts[1]) % 360, s, l),
    hslToHex((h + COLOR_THEORY.triadicHueShifts[2]) % 360, s, l),
  ];
}

/**
 * Derives a color for a feature using palette colors or jittered variations.
 * @param baseColor - The main creature color
 * @param paletteColors - Array of pre-calculated colors from color theory
 * @param featureIndex - Index of the feature (for palette selection)
 * @param seed - Seed for jittered fallback generation
 */
function deriveFeatureColor(
  baseColor: string,
  paletteColors: string[],
  featureIndex: number,
  seed: number
): string {
  if (paletteColors.length > 0) {
    return paletteColors[featureIndex % paletteColors.length];
  }

  const [h, s, l] = hexToHsl(baseColor);
  const hueShift = jitter(0, seed, COLOR_THEORY.fallbackHueVariation);
  const satShift = jitter(0, seed + 1, s * COLOR_THEORY.fallbackSaturationVariationFactor);
  
  return hslToHex(
    (h + hueShift + 360) % 360,
    Math.max(0, Math.min(100, s + satShift)),
    l
  );
}

// =============================================================================
// GEOMETRY GENERATORS
// =============================================================================

interface Point {
  x: number;
  y: number;
  angle: number;
}

/**
 * Generates points around a circle with organic variation to create blob shapes.
 */
function generateBlobPoints(
  centerX: number,
  centerY: number,
  radius: number,
  seed: number
): Point[] {
  const pointCount = Math.floor(
    jitter(BODY_CONFIG.pointCount, seed, BODY_CONFIG.pointCountVariation)
  );
  const angleStep = (Math.PI * 2) / pointCount;
  const points: Point[] = [];

  for (let pointIndex = 0; pointIndex <= pointCount; pointIndex++) {
    const angle = pointIndex * angleStep;
    const radiusVariation = jitter(
      radius,
      seed + pointIndex * 10,
      radius * BODY_CONFIG.radiusVariation
    );
    const x = centerX + Math.cos(angle) * radiusVariation;
    const y = centerY + Math.sin(angle) * radiusVariation;
    points.push({ x, y, angle });
  }

  return points;
}

/**
 * Converts blob points into an SVG path using cubic Bezier curves.
 */
function generateBlobPath(points: Point[], seed: number): string {
  let path = "";

  for (let i = 0; i <= points.length - 1; i++) {
    const { x, y } = points[i];

    if (i === 0) {
      path += `M ${x} ${y}`;
    } else {
      const prev = points[i - 1];
      const normalAngle = (prev.angle + points[i].angle) / 2;
      const bulge = seededRandom(seed + i * 100) > 0.5 ? 1.3 : 0.9;
      const radiusVariation = Math.sqrt(
        Math.pow(x - BODY_CONFIG.centerX, 2) + Math.pow(y - BODY_CONFIG.centerY, 2)
      );

      const cp1x = prev.x + Math.cos(normalAngle) * radiusVariation * BODY_CONFIG.curveControlPointFactor * bulge;
      const cp1y = prev.y + Math.sin(normalAngle) * radiusVariation * BODY_CONFIG.curveControlPointFactor * bulge;
      const cp2x = x + Math.cos(normalAngle) * radiusVariation * BODY_CONFIG.curveControlPointFactor * bulge;
      const cp2y = y + Math.sin(normalAngle) * radiusVariation * BODY_CONFIG.curveControlPointFactor * bulge;

      path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${x} ${y}`;
    }
  }

  return path + " Z";
}

/**
 * Checks if a point falls within the blob's boundary (for collision detection).
 */
function isPointInBlob(
  x: number,
  y: number,
  centerX: number,
  centerY: number,
  radius: number,
  seed: number
): boolean {
  const dx = x - centerX;
  const dy = y - centerY;
  const angle = Math.atan2(dy, dx);

  const points = 8;
  const angleStep = (Math.PI * 2) / points;
  const normalizedAngle = (angle + Math.PI * 2) % (Math.PI * 2);
  const closestPointIndex = Math.round(normalizedAngle / angleStep);
  const radiusVariation = jitter(
    radius,
    seed + closestPointIndex * 10,
    radius * 0.3
  );

  const distance = Math.sqrt(dx * dx + dy * dy);
  return distance < radiusVariation * EYE_CONFIG.collisionRadiusFactor;
}

/**
 * Extracts points along the top curve of the blob for wing placement.
 */
function getTopCurvePoint(t: number, points: Point[]): Point {
  const topPoints = points.filter(
    (p) => p.angle >= CURVE_ANGLES.topStart && p.angle <= CURVE_ANGLES.topEnd
  );

  if (topPoints.length === 0) return points[0];

  const index = Math.floor(t * (topPoints.length - 1));
  return topPoints[index];
}

/**
 * Extracts points along the bottom curve of the blob for leg placement.
 */
function getBottomCurvePoint(t: number, points: Point[]): Point {
  const bottomPoints = points.filter(
    (p) => p.angle >= CURVE_ANGLES.bottomStart && p.angle <= CURVE_ANGLES.bottomEnd
  );

  if (bottomPoints.length === 0) return points[0];

  const index = Math.min(
    Math.floor(t * bottomPoints.length),
    bottomPoints.length - 1
  );

  return bottomPoints[index];
}

// =============================================================================
// FEATURE RENDERERS
// =============================================================================

/**
 * Generates SVG markup for creature tails.
 */
function renderTails(
  tailCount: number,
  triadicColors: string[],
  mainColor: string
): string {
  if (tailCount === 0) return "";

  return Array.from({ length: tailCount })
    .map((_, tailIndex) => {
      const totalTails = tailCount;
      const angleSpread = TAIL_CONFIG.angleSpreadDegrees;
      const startAngle = totalTails > 1 ? -angleSpread / 2 : TAIL_CONFIG.defaultAngle;
      const angleStep = totalTails > 1 ? angleSpread / (totalTails - 1) : 0;
      const angle = startAngle + angleStep * tailIndex;

      const originX = jitter(
        tailCount === 1 ? TAIL_CONFIG.singleTailOriginX : TAIL_CONFIG.multiTailOriginX,
        tailIndex * 100
      );
      const originY = jitter(
        tailCount === 1 ? TAIL_CONFIG.singleTailOriginY : TAIL_CONFIG.multiTailOriginY,
        tailIndex * 100 + 1
      );

      const seed = tailIndex * 100 + 50;
      const tailColor = deriveFeatureColor(mainColor, triadicColors, tailIndex, seed);

      const tailPath = `
        M 0,0
        C ${jitter(12, tailIndex * 100 + 20)},${jitter(-10, tailIndex * 100 + 21)} ${jitter(18, tailIndex * 100 + 22)},${jitter(-30, tailIndex * 100 + 23)} ${jitter(20, tailIndex * 100 + 24)},${jitter(-35, tailIndex * 100 + 25)}
        S ${jitter(15, tailIndex * 100 + 26)},${jitter(-55, tailIndex * 100 + 27)} ${jitter(25, tailIndex * 100 + 28)},${jitter(-65, tailIndex * 100 + 29)}
      `;

      const strokeWidth = jitter(TAIL_CONFIG.strokeWidth, tailIndex * 100 + 30, TAIL_CONFIG.strokeWidthVariation);
      const opacity = jitter(TAIL_CONFIG.baseOpacity, tailIndex * 100 + 4, TAIL_CONFIG.opacityVariation);

      return `<path d="${tailPath}" fill="none" stroke="${tailColor}" stroke-width="${strokeWidth}" stroke-linecap="round" opacity="${opacity}" transform="translate(${originX}, ${originY}) rotate(${angle})" />`;
    })
    .join("");
}

/**
 * Generates SVG markup for creature legs.
 */
function renderLegs(
  legCount: number,
  blobPoints: Point[],
  analogousColors: string[],
  mainColor: string
): string {
  if (legCount === 0) return "";

  return Array.from({ length: legCount })
    .map((_, legIndex) => {
      const t = legCount === 1 ? 0.5 : legIndex / (legCount - 1);
      const curvePoint = getBottomCurvePoint(t, blobPoints);

      const seed = legIndex * 200 + 100;
      const legColor = deriveFeatureColor(mainColor, analogousColors, legIndex, seed);

      const perpAngle = curvePoint.angle + Math.PI / 2;

      return `<rect x="-${LEG_CONFIG.width / 2}" y="-${LEG_CONFIG.height}" width="${LEG_CONFIG.width}" height="${LEG_CONFIG.height}" rx="${LEG_CONFIG.borderRadius}" ry="${LEG_CONFIG.borderRadius}" fill="${legColor}" opacity="${LEG_CONFIG.fullOpacity}" transform="translate(${curvePoint.x}, ${curvePoint.y}) rotate(${(perpAngle * 180) / Math.PI})" />`;
    })
    .join("");
}

/**
 * Generates SVG markup for creature wings.
 */
function renderWings(
  wingCount: number,
  blobPoints: Point[],
  mainColor: string
): string {
  if (wingCount === 0) return "";

  return Array.from({ length: wingCount })
    .map((_, wingIndex) => {
      const t = wingCount === 1 ? 0.5 : wingIndex / (wingCount - 1);
      const curvePoint = getTopCurvePoint(t, blobPoints);
      
      const hueJitter = jitter(0, wingIndex * 400 + 10, 5);
      const wingColor = getComplementaryColor(mainColor, hueJitter);
      const perpAngle = curvePoint.angle - Math.PI / 2;
      const opacity = jitter(WING_CONFIG.baseOpacity, wingIndex * 400 + 3, WING_CONFIG.opacityVariation);

      return `<polygon points="${WING_CONFIG.polygonPoints}" fill="${wingColor}" opacity="${opacity}" transform="translate(${curvePoint.x}, ${curvePoint.y + WING_CONFIG.verticalOffset}) rotate(${(perpAngle * 180) / Math.PI})" />`;
    })
    .join("");
}

/**
 * Generates SVG markup for creature eyes with collision detection.
 */
function renderEyes(
  eyeCount: number,
  blobSeed: number
): string {
  if (eyeCount === 0) return "";

  return Array.from({ length: eyeCount })
    .map((_, eyeIndex) => {
      const col = eyeIndex % EYE_CONFIG.gridColumns;
      const row = Math.floor(eyeIndex / EYE_CONFIG.gridColumns);
      const baseXOffset = col * EYE_CONFIG.columnSpacing;
      const baseYOffset = row * EYE_CONFIG.rowSpacing;

      let eyeX = jitter(EYE_CONFIG.baseX + baseXOffset, eyeIndex * 500);
      let eyeY = jitter(EYE_CONFIG.baseY + baseYOffset, eyeIndex * 500 + 1);

      for (let attempt = 0; attempt < EYE_CONFIG.maxCollisionAttempts; attempt++) {
        if (
          isPointInBlob(
            eyeX,
            eyeY,
            BODY_CONFIG.centerX,
            BODY_CONFIG.centerY,
            BODY_CONFIG.baseRadius,
            blobSeed
          )
        ) {
          break;
        }
        eyeX = jitter(EYE_CONFIG.collisionRetryX, eyeIndex * 500 + attempt * 2);
        eyeY = jitter(EYE_CONFIG.collisionRetryY, eyeIndex * 500 + attempt * 2 + 1);
      }

      const radius = jitter(EYE_CONFIG.baseRadius, eyeIndex * 500 + 2);

      return `<circle cx="${eyeX}" cy="${eyeY}" r="${radius}" fill="${EYE_CONFIG.fillColor}" />`;
    })
    .join("");
}

// =============================================================================
// MAIN GENERATION FUNCTION
// =============================================================================

/**
 * Generates a complete SVG string for a procedural creature based on physical traits.
 * 
 * @param traits - Physical characteristics (eyes, legs, tails, wings, color)
 * @param type - Optional type identifier ("cat" disables color theory palettes)
 * @returns Complete SVG markup string
 */
export function generateSvgString(
  traits: IPhysicalTraits,
  type?: string
): string {
  validateTraits(traits);

  const blobSeed =
    traits.eyes * 1000 + traits.legs * 100 + traits.tails * 10 + traits.wings;

  const blobPoints = generateBlobPoints(
    BODY_CONFIG.centerX,
    BODY_CONFIG.centerY,
    BODY_CONFIG.baseRadius,
    blobSeed
  );

  const mainColor = traits.colour;
  let analogousColors: string[] = [];
  let triadicColors: string[] = [];

  if (type !== "cat") {
    analogousColors = getAnalogousColors(mainColor);
    triadicColors = getTriadicColors(mainColor);
  }

  const tails = renderTails(traits.tails, triadicColors, mainColor);
  const bodyPath = generateBlobPath(blobPoints, blobSeed);
  const legs = renderLegs(traits.legs, blobPoints, analogousColors, mainColor);
  const wings = renderWings(traits.wings, blobPoints, mainColor);
  const eyes = renderEyes(traits.eyes, blobSeed);

  return `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">${tails}<path d="${bodyPath}" fill="${mainColor}" />${legs}${wings}${eyes}</svg>`;
}