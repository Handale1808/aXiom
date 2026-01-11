import { useState, useEffect, useMemo } from "react";

export interface ScaledValues {
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
  text: {
    large: number;
    mediumHeading: number;
    tiny: number;
    extraSmall: number;
  };
  spacing: {
    gapSmall: number;
    gapMedium: number;
    gapLarge: number;
    marginSmall: number;
    marginMedium: number;
    marginLarge: number;
    marginExtraLarge: number;
  };
  padding: {
    small: number;
    medium: number;
    large: number;
    extraLarge: number;
    buttonX: number;
  };
  interactive: {
    checkboxSmall: number;
    checkboxLarge: number;
    iconSize: number;
    catAvatarSize: number;
    loadingIndicator: number;
    tagPaddingX: number;
    tagPaddingY: number;
  };
  layout: {
    maxHeightScrollable: number;
    gridCols: {
      checkbox: number;
      catIndicator: number;
      sentiment: number;
      priority: number;
      view: number;
      delete: number;
    };
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

  text: {
    large: { min: 24, max: 36 },
    mediumHeading: { min: 18, max: 20 },
    tiny: { min: 9, max: 10 },
    extraSmall: { min: 10, max: 12 },
  },
  spacing: {
    gapSmall: { min: 8, max: 12 },
    gapMedium: { min: 12, max: 16 },
    gapLarge: { min: 16, max: 24 },
    marginSmall: { min: 8, max: 12 },
    marginMedium: { min: 16, max: 24 },
    marginLarge: { min: 24, max: 32 },
    marginExtraLarge: { min: 24, max: 32 },
  },
  padding: {
    small: { min: 8, max: 12 },
    medium: { min: 12, max: 16 },
    large: { min: 16, max: 20 },
    extraLarge: { min: 24, max: 48 },
    buttonX: { min: 12, max: 32 },
  },
  interactive: {
    checkboxSmall: { min: 16, max: 16 },
    checkboxLarge: { min: 20, max: 16 },
    iconSize: { min: 16, max: 20 },
    catAvatarSize: { min: 48, max: 64 },
    loadingIndicator: { min: 8, max: 12 },
    tagPaddingX: { min: 6, max: 8 },
    tagPaddingY: { min: 2, max: 2 },
  },
  layout: {
    maxHeightScrollable: { min: 160, max: 128 },
    gridCols: {
      checkbox: { min: 44, max: 40 },
      catIndicator: { min: 30, max: 30 },
      sentiment: { min: 50, max: 120 },
      priority: { min: 50, max: 120 },
      view: { min: 0, max: 60 },
      delete: { min: 0, max: 60 },
    },
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
    // Existing values
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

    // New values for feedback components
    text: {
      large: linearInterpolate(
        width,
        MIN_WIDTH,
        MAX_WIDTH,
        SCALING_CONFIG.text.large.min,
        SCALING_CONFIG.text.large.max
      ),
      mediumHeading: linearInterpolate(
        width,
        MIN_WIDTH,
        MAX_WIDTH,
        SCALING_CONFIG.text.mediumHeading.min,
        SCALING_CONFIG.text.mediumHeading.max
      ),
      tiny: linearInterpolate(
        width,
        MIN_WIDTH,
        MAX_WIDTH,
        SCALING_CONFIG.text.tiny.min,
        SCALING_CONFIG.text.tiny.max
      ),
      extraSmall: linearInterpolate(
        width,
        MIN_WIDTH,
        MAX_WIDTH,
        SCALING_CONFIG.text.extraSmall.min,
        SCALING_CONFIG.text.extraSmall.max
      ),
    },
    spacing: {
      gapSmall: linearInterpolate(
        width,
        MIN_WIDTH,
        MAX_WIDTH,
        SCALING_CONFIG.spacing.gapSmall.min,
        SCALING_CONFIG.spacing.gapSmall.max
      ),
      gapMedium: linearInterpolate(
        width,
        MIN_WIDTH,
        MAX_WIDTH,
        SCALING_CONFIG.spacing.gapMedium.min,
        SCALING_CONFIG.spacing.gapMedium.max
      ),
      gapLarge: linearInterpolate(
        width,
        MIN_WIDTH,
        MAX_WIDTH,
        SCALING_CONFIG.spacing.gapLarge.min,
        SCALING_CONFIG.spacing.gapLarge.max
      ),
      marginSmall: linearInterpolate(
        width,
        MIN_WIDTH,
        MAX_WIDTH,
        SCALING_CONFIG.spacing.marginSmall.min,
        SCALING_CONFIG.spacing.marginSmall.max
      ),
      marginMedium: linearInterpolate(
        width,
        MIN_WIDTH,
        MAX_WIDTH,
        SCALING_CONFIG.spacing.marginMedium.min,
        SCALING_CONFIG.spacing.marginMedium.max
      ),
      marginLarge: linearInterpolate(
        width,
        MIN_WIDTH,
        MAX_WIDTH,
        SCALING_CONFIG.spacing.marginLarge.min,
        SCALING_CONFIG.spacing.marginLarge.max
      ),
      marginExtraLarge: linearInterpolate(
        width,
        MIN_WIDTH,
        MAX_WIDTH,
        SCALING_CONFIG.spacing.marginExtraLarge.min,
        SCALING_CONFIG.spacing.marginExtraLarge.max
      ),
    },
    padding: {
      small: linearInterpolate(
        width,
        MIN_WIDTH,
        MAX_WIDTH,
        SCALING_CONFIG.padding.small.min,
        SCALING_CONFIG.padding.small.max
      ),
      medium: linearInterpolate(
        width,
        MIN_WIDTH,
        MAX_WIDTH,
        SCALING_CONFIG.padding.medium.min,
        SCALING_CONFIG.padding.medium.max
      ),
      large: linearInterpolate(
        width,
        MIN_WIDTH,
        MAX_WIDTH,
        SCALING_CONFIG.padding.large.min,
        SCALING_CONFIG.padding.large.max
      ),
      extraLarge: linearInterpolate(
        width,
        MIN_WIDTH,
        MAX_WIDTH,
        SCALING_CONFIG.padding.extraLarge.min,
        SCALING_CONFIG.padding.extraLarge.max
      ),
      buttonX: linearInterpolate(
        width,
        MIN_WIDTH,
        MAX_WIDTH,
        SCALING_CONFIG.padding.buttonX.min,
        SCALING_CONFIG.padding.buttonX.max
      ),
    },
    interactive: {
      checkboxSmall: linearInterpolate(
        width,
        MIN_WIDTH,
        MAX_WIDTH,
        SCALING_CONFIG.interactive.checkboxSmall.min,
        SCALING_CONFIG.interactive.checkboxSmall.max
      ),
      checkboxLarge: linearInterpolate(
        width,
        MIN_WIDTH,
        MAX_WIDTH,
        SCALING_CONFIG.interactive.checkboxLarge.min,
        SCALING_CONFIG.interactive.checkboxLarge.max
      ),
      iconSize: linearInterpolate(
        width,
        MIN_WIDTH,
        MAX_WIDTH,
        SCALING_CONFIG.interactive.iconSize.min,
        SCALING_CONFIG.interactive.iconSize.max
      ),
      catAvatarSize: linearInterpolate(
        width,
        MIN_WIDTH,
        MAX_WIDTH,
        SCALING_CONFIG.interactive.catAvatarSize.min,
        SCALING_CONFIG.interactive.catAvatarSize.max
      ),
      loadingIndicator: linearInterpolate(
        width,
        MIN_WIDTH,
        MAX_WIDTH,
        SCALING_CONFIG.interactive.loadingIndicator.min,
        SCALING_CONFIG.interactive.loadingIndicator.max
      ),
      tagPaddingX: linearInterpolate(
        width,
        MIN_WIDTH,
        MAX_WIDTH,
        SCALING_CONFIG.interactive.tagPaddingX.min,
        SCALING_CONFIG.interactive.tagPaddingX.max
      ),
      tagPaddingY: linearInterpolate(
        width,
        MIN_WIDTH,
        MAX_WIDTH,
        SCALING_CONFIG.interactive.tagPaddingY.min,
        SCALING_CONFIG.interactive.tagPaddingY.max
      ),
    },
    layout: {
      maxHeightScrollable: linearInterpolate(
        width,
        MIN_WIDTH,
        MAX_WIDTH,
        SCALING_CONFIG.layout.maxHeightScrollable.min,
        SCALING_CONFIG.layout.maxHeightScrollable.max
      ),
      gridCols: {
        checkbox: linearInterpolate(
          width,
          MIN_WIDTH,
          MAX_WIDTH,
          SCALING_CONFIG.layout.gridCols.checkbox.min,
          SCALING_CONFIG.layout.gridCols.checkbox.max
        ),
        catIndicator: linearInterpolate(
          width,
          MIN_WIDTH,
          MAX_WIDTH,
          SCALING_CONFIG.layout.gridCols.catIndicator.min,
          SCALING_CONFIG.layout.gridCols.catIndicator.max
        ),
        sentiment: linearInterpolate(
          width,
          MIN_WIDTH,
          MAX_WIDTH,
          SCALING_CONFIG.layout.gridCols.sentiment.min,
          SCALING_CONFIG.layout.gridCols.sentiment.max
        ),
        priority: linearInterpolate(
          width,
          MIN_WIDTH,
          MAX_WIDTH,
          SCALING_CONFIG.layout.gridCols.priority.min,
          SCALING_CONFIG.layout.gridCols.priority.max
        ),
        view: linearInterpolate(
          width,
          MIN_WIDTH,
          MAX_WIDTH,
          SCALING_CONFIG.layout.gridCols.view.min,
          SCALING_CONFIG.layout.gridCols.view.max
        ),
        delete: linearInterpolate(
          width,
          MIN_WIDTH,
          MAX_WIDTH,
          SCALING_CONFIG.layout.gridCols.delete.min,
          SCALING_CONFIG.layout.gridCols.delete.max
        ),
      },
    },
  };
}

function getDefaultScaledValues(): ScaledValues {
  return calculateScaledValues(768);
}

export function useResponsiveScaling(): ScaledValues {
  const [windowWidth, setWindowWidth] = useState<number>(768);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    setWindowWidth(window.innerWidth);
  }, []);

  useEffect(() => {
    if (!isClient) return;

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
  }, [isClient]);

  const scaledValues = useMemo(() => {
    return calculateScaledValues(windowWidth);
  }, [windowWidth]);

  return scaledValues;
}
