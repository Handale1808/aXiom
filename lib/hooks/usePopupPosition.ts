import { useEffect, useRef, useState, CSSProperties } from "react";

interface PopupPositionConfig {
  isOpen: boolean;
  minSpacing?: number;
  popupWidth?: number;
}

interface PopupPositionResult {
  triggerRef: React.RefObject<HTMLDivElement>;
  popupRef: React.RefObject<HTMLDivElement>;
  popupStyle: CSSProperties;
}

function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout | null = null;

  return (...args: Parameters<T>) => {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      func(...args);
    }, wait);
  };
}

export function usePopupPosition(
  config: PopupPositionConfig
): PopupPositionResult {
  const { isOpen, minSpacing = 2, popupWidth: configPopupWidth } = config;

  const triggerRef = useRef<HTMLDivElement>(null!);
  const popupRef = useRef<HTMLDivElement>(null!);

  const [popupStyle, setPopupStyle] = useState<CSSProperties>({});

  const calculatePosition = () => {
    if (!triggerRef.current) return;

    const buttonRect = triggerRef.current.getBoundingClientRect();
    const viewportWidth = Math.min(window.innerWidth, document.documentElement.clientWidth) - 25;

    const borderWidth = 4;
    const totalSpacing = minSpacing * 2;
    let calculatedWidth = configPopupWidth || 200;

    // Calculate max available width
    const maxAvailableWidth = viewportWidth - totalSpacing - borderWidth;

    // If popup is too wide for screen, shrink it
    if (calculatedWidth > maxAvailableWidth) {
      calculatedWidth = maxAvailableWidth;
    }

    // Center the popup horizontally on the screen
    const calculatedLeft = (viewportWidth - calculatedWidth - borderWidth) / 2;

    const style: CSSProperties = {
      left: `${calculatedLeft}px`,
      width: `${calculatedWidth}px`,
    };

    setPopupStyle(style);
  };

  useEffect(() => {
    if (!isOpen) {
      setPopupStyle({});
      return;
    }

    requestAnimationFrame(() => {
      calculatePosition();
    });

    const debouncedResize = debounce(() => {
      if (isOpen) {
        calculatePosition();
      }
    }, 100);

    window.addEventListener("resize", debouncedResize);

    return () => {
      window.removeEventListener("resize", debouncedResize);
    };
  }, [isOpen, minSpacing, configPopupWidth]);

  return {
    triggerRef,
    popupRef,
    popupStyle,
  };
}
