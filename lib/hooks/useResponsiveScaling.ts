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
    base: number;
    small: number;
    tiny: number;
    extraSmall: number;
    tab: number;
  };
  spacing: {
    gapSmall: number;
    gapMedium: number;
    gapLarge: number;
    marginSmall: number;
    marginMedium: number;
    marginLarge: number;
    marginExtraLarge: number;
    spaceYSmall: number;
    spaceYMedium: number;
    marginTopSmall: number;
    marginTopMedium: number;
    paddingTopSmall: number;
    paddingBottomSmall: number;
  };
  padding: {
    small: number;
    medium: number;
    large: number;
    extraLarge: number;
    buttonX: number;
    inputSmall: number;
    containerSmall: number;
    containerMedium: number;
    emptyStateY: number;
  };
  interactive: {
    checkboxSmall: number;
    checkboxLarge: number;
    iconSize: number;
    catAvatarSize: number;
    loadingIndicator: number;
    tagPaddingX: number;
    tagPaddingY: number;
    minTouchTarget: number;
    badgePaddingXSmall: number;
    badgePaddingYSmall: number;
    badgePaddingX: number;
    badgePaddingY: number;
  };
  layout: {
    maxHeightScrollable: number;
    showMobileLayout: boolean;
    showTabletLayout: boolean;
    showDesktopLayout: boolean;
    gridCols: {
      checkbox: number;
      catIndicator: number;
      sentiment: number;
      priority: number;
      view: number;
      delete: number;
    };
  };
  modal: {
    closeButtonSize: number;
    maxWidth: number;
    margin: number;
    borderRadius: number;
    scrollbarWidth: number;
  };
  imageContainer: {
    catDisplay: number;
  };
  decorations: {
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

  text: {
    large: { min: 24, max: 36 },
    mediumHeading: { min: 18, max: 20 },
    base: { min: 14, max: 16 },
    small: { min: 12, max: 14 },
    tiny: { min: 9, max: 10 },
    extraSmall: { min: 10, max: 12 },
    tab: { min: 10, max: 14 },
  },
  spacing: {
    gapSmall: { min: 8, max: 12 },
    gapMedium: { min: 12, max: 16 },
    gapLarge: { min: 16, max: 24 },
    marginSmall: { min: 8, max: 12 },
    marginMedium: { min: 16, max: 24 },
    marginLarge: { min: 24, max: 32 },
    marginExtraLarge: { min: 24, max: 32 },
    spaceYSmall: { min: 16, max: 20 },
    spaceYMedium: { min: 16, max: 24 },
    marginTopSmall: { min: 12, max: 16 },
    marginTopMedium: { min: 16, max: 24 },
    paddingTopSmall: { min: 16, max: 24 },
    paddingBottomSmall: { min: 12, max: 16 },
  },
  padding: {
    small: { min: 8, max: 12 },
    medium: { min: 12, max: 16 },
    large: { min: 16, max: 20 },
    extraLarge: { min: 24, max: 48 },
    buttonX: { min: 12, max: 32 },
    inputSmall: { min: 10, max: 12 },
    containerSmall: { min: 16, max: 20 },
    containerMedium: { min: 16, max: 24 },
    emptyStateY: { min: 24, max: 32 },
  },
  interactive: {
    checkboxSmall: { min: 16, max: 16 },
    checkboxLarge: { min: 20, max: 16 },
    iconSize: { min: 16, max: 20 },
    catAvatarSize: { min: 48, max: 64 },
    loadingIndicator: { min: 8, max: 12 },
    tagPaddingX: { min: 6, max: 8 },
    tagPaddingY: { min: 2, max: 2 },
    minTouchTarget: { min: 44, max: 44 },
    badgePaddingXSmall: { min: 8, max: 12 },
    badgePaddingYSmall: { min: 6, max: 8 },
    badgePaddingX: { min: 12, max: 12 },
    badgePaddingY: { min: 8, max: 8 },
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
  modal: {
    closeButtonSize: { min: 44, max: 44 },
    maxWidth: { min: 320, max: 768 },
    margin: { min: 0, max: 16 },
    borderRadius: { min: 0, max: 8 },
    scrollbarWidth: { min: 2, max: 2 },
  },
  imageContainer: {
    catDisplay: { min: 192, max: 256 },
  },
  decorations: {
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
      base: linearInterpolate(
        width,
        MIN_WIDTH,
        MAX_WIDTH,
        SCALING_CONFIG.text.base.min,
        SCALING_CONFIG.text.base.max
      ),
      small: linearInterpolate(
        width,
        MIN_WIDTH,
        MAX_WIDTH,
        SCALING_CONFIG.text.small.min,
        SCALING_CONFIG.text.small.max
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
      tab: linearInterpolate(
        width,
        MIN_WIDTH,
        MAX_WIDTH,
        SCALING_CONFIG.text.tab.min,
        SCALING_CONFIG.text.tab.max
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
      spaceYSmall: linearInterpolate(
        width,
        MIN_WIDTH,
        MAX_WIDTH,
        SCALING_CONFIG.spacing.spaceYSmall.min,
        SCALING_CONFIG.spacing.spaceYSmall.max
      ),
      spaceYMedium: linearInterpolate(
        width,
        MIN_WIDTH,
        MAX_WIDTH,
        SCALING_CONFIG.spacing.spaceYMedium.min,
        SCALING_CONFIG.spacing.spaceYMedium.max
      ),
      marginTopSmall: linearInterpolate(
        width,
        MIN_WIDTH,
        MAX_WIDTH,
        SCALING_CONFIG.spacing.marginTopSmall.min,
        SCALING_CONFIG.spacing.marginTopSmall.max
      ),
      marginTopMedium: linearInterpolate(
        width,
        MIN_WIDTH,
        MAX_WIDTH,
        SCALING_CONFIG.spacing.marginTopMedium.min,
        SCALING_CONFIG.spacing.marginTopMedium.max
      ),
      paddingTopSmall: linearInterpolate(
        width,
        MIN_WIDTH,
        MAX_WIDTH,
        SCALING_CONFIG.spacing.paddingTopSmall.min,
        SCALING_CONFIG.spacing.paddingTopSmall.max
      ),
      paddingBottomSmall: linearInterpolate(
        width,
        MIN_WIDTH,
        MAX_WIDTH,
        SCALING_CONFIG.spacing.paddingBottomSmall.min,
        SCALING_CONFIG.spacing.paddingBottomSmall.max
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
      inputSmall: linearInterpolate(
        width,
        MIN_WIDTH,
        MAX_WIDTH,
        SCALING_CONFIG.padding.inputSmall.min,
        SCALING_CONFIG.padding.inputSmall.max
      ),
      containerSmall: linearInterpolate(
        width,
        MIN_WIDTH,
        MAX_WIDTH,
        SCALING_CONFIG.padding.containerSmall.min,
        SCALING_CONFIG.padding.containerSmall.max
      ),
      containerMedium: linearInterpolate(
        width,
        MIN_WIDTH,
        MAX_WIDTH,
        SCALING_CONFIG.padding.containerMedium.min,
        SCALING_CONFIG.padding.containerMedium.max
      ),
      emptyStateY: linearInterpolate(
        width,
        MIN_WIDTH,
        MAX_WIDTH,
        SCALING_CONFIG.padding.emptyStateY.min,
        SCALING_CONFIG.padding.emptyStateY.max
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
      minTouchTarget: linearInterpolate(
        width,
        MIN_WIDTH,
        MAX_WIDTH,
        SCALING_CONFIG.interactive.minTouchTarget.min,
        SCALING_CONFIG.interactive.minTouchTarget.max
      ),
      badgePaddingXSmall: linearInterpolate(
        width,
        MIN_WIDTH,
        MAX_WIDTH,
        SCALING_CONFIG.interactive.badgePaddingXSmall.min,
        SCALING_CONFIG.interactive.badgePaddingXSmall.max
      ),
      badgePaddingYSmall: linearInterpolate(
        width,
        MIN_WIDTH,
        MAX_WIDTH,
        SCALING_CONFIG.interactive.badgePaddingYSmall.min,
        SCALING_CONFIG.interactive.badgePaddingYSmall.max
      ),
      badgePaddingX: linearInterpolate(
        width,
        MIN_WIDTH,
        MAX_WIDTH,
        SCALING_CONFIG.interactive.badgePaddingX.min,
        SCALING_CONFIG.interactive.badgePaddingX.max
      ),
      badgePaddingY: linearInterpolate(
        width,
        MIN_WIDTH,
        MAX_WIDTH,
        SCALING_CONFIG.interactive.badgePaddingY.min,
        SCALING_CONFIG.interactive.badgePaddingY.max
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
      showMobileLayout: width < 640,
      showTabletLayout: width >= 640 && width < 768,
      showDesktopLayout: width >= 768,
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
    modal: {
      closeButtonSize: linearInterpolate(
        width,
        MIN_WIDTH,
        MAX_WIDTH,
        SCALING_CONFIG.modal.closeButtonSize.min,
        SCALING_CONFIG.modal.closeButtonSize.max
      ),
      maxWidth: linearInterpolate(
        width,
        MIN_WIDTH,
        MAX_WIDTH,
        SCALING_CONFIG.modal.maxWidth.min,
        SCALING_CONFIG.modal.maxWidth.max
      ),
      margin: linearInterpolate(
        width,
        MIN_WIDTH,
        MAX_WIDTH,
        SCALING_CONFIG.modal.margin.min,
        SCALING_CONFIG.modal.margin.max
      ),
      borderRadius: linearInterpolate(
        width,
        MIN_WIDTH,
        MAX_WIDTH,
        SCALING_CONFIG.modal.borderRadius.min,
        SCALING_CONFIG.modal.borderRadius.max
      ),
      scrollbarWidth: linearInterpolate(
        width,
        MIN_WIDTH,
        MAX_WIDTH,
        SCALING_CONFIG.modal.scrollbarWidth.min,
        SCALING_CONFIG.modal.scrollbarWidth.max
      ),
    },
    imageContainer: {
      catDisplay: linearInterpolate(
        width,
        MIN_WIDTH,
        MAX_WIDTH,
        SCALING_CONFIG.imageContainer.catDisplay.min,
        SCALING_CONFIG.imageContainer.catDisplay.max
      ),
    },
    decorations: {
      cornerSize: linearInterpolate(
        width,
        MIN_WIDTH,
        MAX_WIDTH,
        SCALING_CONFIG.decorations.cornerSize.min,
        SCALING_CONFIG.decorations.cornerSize.max
      ),
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