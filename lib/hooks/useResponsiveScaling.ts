import { useState, useEffect, useMemo } from "react";

interface ScaledValues {
  heading: {
    fontSize: number;
    letterSpacing: number;
  };
  label: {
    fontSize: number;
    letterSpacing: number;
  };
  input: {
    fontSize: number;
    paddingX: number;
    paddingY: number;
    borderWidth: number;
  };
  button: {
    fontSize: number;
    paddingY: number;
  };
  currencySymbol: {
    fontSize: number;
  };
  container: {
    padding: number;
    cornerSize: number;
  };
}

const MIN_WIDTH = 320;
const MAX_WIDTH = 1920;

const SCALING_CONFIG = {
  heading: {
    fontSize: { min: 10, max: 14 },
    letterSpacing: { min: 0.1, max: 0.15 },
  },
  label: {
    fontSize: { min: 10, max: 12 },
    letterSpacing: { min: 0.05, max: 0.1 },
  },
  input: {
    fontSize: { min: 14, max: 16 },
    paddingX: { min: 12, max: 16 },
    paddingY: { min: 8, max: 12 },
  },
  button: {
    fontSize: { min: 14, max: 16 },
    paddingY: { min: 12, max: 16 },
  },
  currencySymbol: {
    fontSize: { min: 14, max: 16 },
  },
  container: {
    padding: { min: 16, max: 24 },
    cornerSize: { min: 12, max: 16 },
  },
};

function linearInterpolate(
  currentWidth: number,
  minWidth: number,
  maxWidth: number,
  minValue: number,
  maxValue: number
): number {
  const clampedWidth = Math.max(minWidth, Math.min(maxWidth, currentWidth));
  
  const ratio = (clampedWidth - minWidth) / (maxWidth - minWidth);
  
  return minValue + ratio * (maxValue - minValue);
}

function calculateScaledValues(width: number): ScaledValues {
  return {
    heading: {
      fontSize: linearInterpolate(
        width,
        MIN_WIDTH,
        MAX_WIDTH,
        SCALING_CONFIG.heading.fontSize.min,
        SCALING_CONFIG.heading.fontSize.max
      ),
      letterSpacing: linearInterpolate(
        width,
        MIN_WIDTH,
        MAX_WIDTH,
        SCALING_CONFIG.heading.letterSpacing.min,
        SCALING_CONFIG.heading.letterSpacing.max
      ),
    },
    label: {
      fontSize: linearInterpolate(
        width,
        MIN_WIDTH,
        MAX_WIDTH,
        SCALING_CONFIG.label.fontSize.min,
        SCALING_CONFIG.label.fontSize.max
      ),
      letterSpacing: linearInterpolate(
        width,
        MIN_WIDTH,
        MAX_WIDTH,
        SCALING_CONFIG.label.letterSpacing.min,
        SCALING_CONFIG.label.letterSpacing.max
      ),
    },
    input: {
      fontSize: linearInterpolate(
        width,
        MIN_WIDTH,
        MAX_WIDTH,
        SCALING_CONFIG.input.fontSize.min,
        SCALING_CONFIG.input.fontSize.max
      ),
      paddingX: linearInterpolate(
        width,
        MIN_WIDTH,
        MAX_WIDTH,
        SCALING_CONFIG.input.paddingX.min,
        SCALING_CONFIG.input.paddingX.max
      ),
      paddingY: linearInterpolate(
        width,
        MIN_WIDTH,
        MAX_WIDTH,
        SCALING_CONFIG.input.paddingY.min,
        SCALING_CONFIG.input.paddingY.max
      ),
      borderWidth: 2,
    },
    button: {
      fontSize: linearInterpolate(
        width,
        MIN_WIDTH,
        MAX_WIDTH,
        SCALING_CONFIG.button.fontSize.min,
        SCALING_CONFIG.button.fontSize.max
      ),
      paddingY: linearInterpolate(
        width,
        MIN_WIDTH,
        MAX_WIDTH,
        SCALING_CONFIG.button.paddingY.min,
        SCALING_CONFIG.button.paddingY.max
      ),
    },
    currencySymbol: {
      fontSize: linearInterpolate(
        width,
        MIN_WIDTH,
        MAX_WIDTH,
        SCALING_CONFIG.currencySymbol.fontSize.min,
        SCALING_CONFIG.currencySymbol.fontSize.max
      ),
    },
    container: {
      padding: linearInterpolate(
        width,
        MIN_WIDTH,
        MAX_WIDTH,
        SCALING_CONFIG.container.padding.min,
        SCALING_CONFIG.container.padding.max
      ),
      cornerSize: linearInterpolate(
        width,
        MIN_WIDTH,
        MAX_WIDTH,
        SCALING_CONFIG.container.cornerSize.min,
        SCALING_CONFIG.container.cornerSize.max
      ),
    },
  };
}

function getDefaultScaledValues(): ScaledValues {
  return calculateScaledValues(768);
}

export function useResponsiveScaling(): ScaledValues {
  const [windowWidth, setWindowWidth] = useState<number>(() => {
    if (typeof window !== "undefined") {
      return window.innerWidth;
    }
    return 768;
  });

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    let timeoutId: NodeJS.Timeout;

    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setWindowWidth(window.innerWidth);
      }, 150);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const scaledValues = useMemo(() => {
    return calculateScaledValues(windowWidth);
  }, [windowWidth]);

  return scaledValues;
}