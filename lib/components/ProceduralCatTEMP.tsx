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

  const generateBlobPath = (centerX: number, centerY: number, radius: number, seed: number) => {
    const points = 8;
    const angleStep = (Math.PI * 2) / points;
    let path = '';

    for (let i = 0; i <= points; i++) {
      const angle = i * angleStep;
      const radiusVariation = jitter(radius, seed + i * 10, radius * 0.3);
      const x = centerX + Math.cos(angle) * radiusVariation;
      const y = centerY + Math.sin(angle) * radiusVariation;

      if (i === 0) {
        path += `M ${x} ${y}`;
      } else {
        const prevAngle = (i - 1) * angleStep;
        const prevRadiusVariation = jitter(radius, seed + (i - 1) * 10, radius * 0.3);
        const prevX = centerX + Math.cos(prevAngle) * prevRadiusVariation;
        const prevY = centerY + Math.sin(prevAngle) * prevRadiusVariation;

        const cp1x = prevX + Math.cos(prevAngle + angleStep / 3) * (radiusVariation * 0.2);
        const cp1y = prevY + Math.sin(prevAngle + angleStep / 3) * (radiusVariation * 0.2);
        const cp2x = x - Math.cos(angle - angleStep / 3) * (radiusVariation * 0.2);
        const cp2y = y - Math.sin(angle - angleStep / 3) * (radiusVariation * 0.2);

        path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${x} ${y}`;
      }
    }

    return path + ' Z';
  };

  const blobSeed = traits.eyes * 1000 + traits.legs * 100 + traits.tails * 10 + traits.wings;

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
      return hex.length === 1 ? '0' + hex : hex;
    };

    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  };

  const getComplementaryColor = (hex: string, jitterAmount: number = 0): string => {
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
          const angle = startAngle + (angleStep * i);
          const originX = jitter(155, i * 100);
          const originY = jitter(100, i * 100 + 1);
          const tailColor = triadicColors[i % 3];
          
          return (
            <ellipse
              key={`tail-${i}`}
              cx={jitter(160, i * 100 + 8)}
              cy={jitter(100, i * 100 + 9)}
              rx={jitter(25, i * 100 + 10)}
              ry={jitter(6, i * 100 + 11)}
              fill={tailColor}
              opacity={jitter(0.6, i * 100 + 4, 0.1)}
              transform={`rotate(${angle} ${originX} ${originY})`}
            />
          );
        })}

      <path
        d={generateBlobPath(100, 95, 50, blobSeed)}
        fill={traits.color}
      />

      {traits.legs > 0 &&
        Array.from({ length: traits.legs }).map((_, i) => {
          const spacing = 100 / (traits.legs + 1);
          const x = jitter(50 + spacing * (i + 1), i * 300);
          const legColor = analogousColors[i % 3];
          return (
            <rect
              key={`leg-${i}`}
              x={jitter(x, i * 300 + 2)}
              y={125}
              width={6}
              height={25} 
              rx={3}
              ry={3}
              fill={legColor}
              opacity={1}
            />
          );
        })}

      {traits.wings > 0 &&
        Array.from({ length: traits.wings }).map((_, i) => {
          const xOffset = -20 + (i * 6);
          const baseX = 100 + xOffset;
          const jitteredX = jitter(baseX, i * 400);
          const jitteredY = jitter(60, i * 400 + 1);
          const jitteredY2 = jitter(40, i * 400 + 2);
          const hueJitter = jitter(0, i * 400 + 10, 5);
          const wingColor = getComplementaryColor(traits.color, hueJitter);
          
          return (
            <polygon
              key={`wing-${i}`}
              points={`${jitteredX},${jitteredY} ${jitteredX - 10},${jitteredY2} ${jitteredX + 10},${jitteredY2}`}
              fill={wingColor}
              opacity={jitter(0.6, i * 400 + 3, 0.1)}
            />
          );
        })}

      {traits.eyes > 0 &&
        Array.from({ length: traits.eyes }).map((_, i) => {
          const col = i % 4;
          const row = Math.floor(i / 4);
          const xOffset = col * 12;
          const yOffset = row * 15;
          return (
            <circle
              key={`eye-${i}`}
              cx={jitter(65 + xOffset, i * 500)}
              cy={jitter(80 + yOffset, i * 500 + 1)}
              r={jitter(3, i * 500 + 2)}
              fill="white"
            />
          );
        })}
    </svg>
  );
}