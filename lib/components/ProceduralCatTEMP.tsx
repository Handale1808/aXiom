import { CatTraits } from "@/lib/types/cat-drawing";

interface ProceduralCatProps {
  traits: CatTraits;
}

export default function ProceduralCat({ traits }: ProceduralCatProps) {
  const seededRandom = (seed: number) => {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
  };

  const jitter = (base: number, seed: number, amount: number = 3) => {
    return base + (seededRandom(seed) - 0.5) * amount * 2;
  };

  const generateBlobPoints = (
    centerX: number,
    centerY: number,
    radius: number,
    seed: number
  ) => {
    const pointCount = Math.floor(jitter(16, seed, 4));
    const angleStep = (Math.PI * 2) / pointCount;
    const points: Array<{ x: number; y: number; angle: number }> = [];

    for (let i = 0; i <= pointCount; i++) {
      const angle = i * angleStep;
      const radiusVariation = jitter(radius, seed + i * 10, radius * 0.15);
      const x = centerX + Math.cos(angle) * radiusVariation;
      const y = centerY + Math.sin(angle) * radiusVariation;

      points.push({ x, y, angle });
    }

    return points;
  };

  const generateBlobPath = (
    points: Array<{ x: number; y: number; angle: number }>,
    seed: number
  ) => {
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
          Math.pow(x - 100, 2) + Math.pow(y - 95, 2)
        );

        const cp1x =
          prev.x + Math.cos(normalAngle) * radiusVariation * 0.3 * bulge;
        const cp1y =
          prev.y + Math.sin(normalAngle) * radiusVariation * 0.3 * bulge;
        const cp2x = x + Math.cos(normalAngle) * radiusVariation * 0.3 * bulge;
        const cp2y = y + Math.sin(normalAngle) * radiusVariation * 0.3 * bulge;

        path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${x} ${y}`;
      }
    }

    return path + " Z";
  };

  const blobSeed =
    traits.eyes * 1000 + traits.legs * 100 + traits.tails * 10 + traits.wings;

  const blobPoints = generateBlobPoints(100, 95, 50, blobSeed);

  const hexToHsl = (hex: string): [number, number, number] => {
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
  };

  const hslToHex = (h: number, s: number, l: number): string => {
    h = h / 360;
    s = s / 100;
    l = l / 100;

    let r, g, b;

    if (s === 0) {
      r = g = b = l;
    } else {
      const hue2rgb = (p: number, q: number, t: number) => {
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

    const toHex = (x: number) => {
      const hex = Math.round(x * 255).toString(16);
      return hex.length === 1 ? "0" + hex : hex;
    };

    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  };

  const getComplementaryColor = (
    hex: string,
    jitterAmount: number = 0
  ): string => {
    const [h, s, l] = hexToHsl(hex);
    const newH = (h + 180 + jitterAmount) % 360;
    return hslToHex(newH, s, l);
  };

  const getAnalogousColors = (hex: string): [string, string, string] => {
    const [h, s, l] = hexToHsl(hex);
    return [
      hslToHex((h - 30 + 360) % 360, s, l),
      hslToHex((h - 60 + 360) % 360, s, l),
      hslToHex((h + 30) % 360, s, l),
    ];
  };

  const getTriadicColors = (hex: string): [string, string, string] => {
    const [h, s, l] = hexToHsl(hex);
    return [
      hslToHex((h + 120) % 360, s, l),
      hslToHex((h + 240) % 360, s, l),
      hslToHex((h + 160) % 360, s, l),
    ];
  };

  const isPointInBlob = (
    x: number,
    y: number,
    centerX: number,
    centerY: number,
    radius: number,
    seed: number
  ) => {
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
    return distance < radiusVariation * 0.8;
  };

  const getTopCurvePoint = (
    t: number,
    points: Array<{ x: number; y: number; angle: number }>
  ) => {
    const topPoints = points.filter(
      (p) => p.angle >= Math.PI * 1.25 && p.angle <= Math.PI * 1.75
    );

    if (topPoints.length === 0) return points[0];

    const index = Math.floor(t * (topPoints.length - 1));
    return topPoints[index];
  };

  const getBottomCurvePoint = (
    t: number,
    points: Array<{ x: number; y: number; angle: number }>
  ) => {
    const bottomPoints = points.filter(
      (p) => p.angle >= Math.PI * -20 && p.angle <= Math.PI * 0.9
    );

    if (bottomPoints.length === 0) return points[0];

    const index = Math.min(
      Math.floor(t * bottomPoints.length),
      bottomPoints.length - 1
    );

    return bottomPoints[index];
  };

  const analogousColors = getAnalogousColors(traits.color);
  const triadicColors = getTriadicColors(traits.color);

  return (
    <svg viewBox="0 0 200 200" className="w-full h-full">
      {traits.tails > 0 &&
        Array.from({ length: traits.tails }).map((_, i) => {
          const totalTails = traits.tails;
          const angleSpread = 60;
          const startAngle = -angleSpread / 2;
          const angleStep = totalTails > 1 ? angleSpread / (totalTails - 1) : 0;
          const angle = startAngle + angleStep * i;
          const originX = jitter(140, i * 100);
          const originY = jitter(100, i * 100 + 1);
          const tailColor = triadicColors[i % 3];

          const tailPath = `
      M 0,0
      Q ${jitter(15, i * 100 + 20)},${jitter(-20, i * 100 + 21)} ${jitter(25, i * 100 + 22)},${jitter(-35, i * 100 + 23)}
      Q ${jitter(30, i * 100 + 24)},${jitter(-45, i * 100 + 25)} ${jitter(32, i * 100 + 26)},${jitter(-60, i * 100 + 27)}
    `;

          return (
            <path
              key={`tail-${i}`}
              d={tailPath}
              fill="none"
              stroke={tailColor}
              strokeWidth={jitter(4, i * 100 + 30, 1)}
              strokeLinecap="round"
              opacity={jitter(0.7, i * 100 + 4, 0.1)}
              transform={`translate(${originX}, ${originY}) rotate(${angle})`}
            />
          );
        })}

      <path d={generateBlobPath(blobPoints, blobSeed)} fill={traits.color} />

      {traits.legs > 0 &&
        Array.from({ length: traits.legs }).map((_, i) => {
          const t = traits.legs === 1 ? 0.5 : i / (traits.legs - 1);
          const curvePoint = getBottomCurvePoint(t, blobPoints);
          const legColor = analogousColors[i % 3];
          const perpAngle = curvePoint.angle + Math.PI / 2;

          console.log("Leg", i, "curvePoint:", curvePoint, "t:", t);

          return (
            <rect
              key={`leg-${i}`}
              x={-3}
              y={-30}
              width={6}
              height={30}
              rx={3}
              ry={3}
              fill={legColor}
              opacity={1}
              transform={`translate(${curvePoint.x}, ${curvePoint.y}) rotate(${(perpAngle * 180) / Math.PI})`}
            />
          );
        })}

      {traits.wings > 0 &&
        Array.from({ length: traits.wings }).map((_, i) => {
          const t = traits.wings === 1 ? 0.5 : i / (traits.wings - 1);
          const curvePoint = getTopCurvePoint(t, blobPoints);
          const hueJitter = jitter(0, i * 400 + 10, 5);
          const wingColor = getComplementaryColor(traits.color, hueJitter);
          const perpAngle = curvePoint.angle - Math.PI / 2;

          return (
            <polygon
              key={`wing-${i}`}
              points="0,-75 -8,0 8,0"
              fill={wingColor}
              opacity={jitter(0.6, i * 400 + 3, 0.1)}
              transform={`translate(${curvePoint.x}, ${curvePoint.y}) rotate(${(perpAngle * 180) / Math.PI})`}
            />
          );
        })}

      {traits.eyes > 0 &&
        Array.from({ length: traits.eyes }).map((_, i) => {
          const col = i % 4;
          const row = Math.floor(i / 4);
          const baseXOffset = col * 12;
          const baseYOffset = row * 15;

          let eyeX = jitter(65 + baseXOffset, i * 500);
          let eyeY = jitter(80 + baseYOffset, i * 500 + 1);

          const maxAttempts = 10;
          for (let attempt = 0; attempt < maxAttempts; attempt++) {
            if (isPointInBlob(eyeX, eyeY, 100, 95, 50, blobSeed)) {
              break;
            }
            eyeX = jitter(80, i * 500 + attempt * 2);
            eyeY = jitter(90, i * 500 + attempt * 2 + 1);
          }

          return (
            <circle
              key={`eye-${i}`}
              cx={eyeX}
              cy={eyeY}
              r={jitter(3, i * 500 + 2)}
              fill="white"
            />
          );
        })}
    </svg>
  );
}
