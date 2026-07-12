"use client";

import { useEffect, useState } from "react";

/** Matches phone portfolio breakpoint (<768px). */
export const PHONE_MAX_WIDTH_PX = 767;

const PORTFOLIO_OVERLAY_FADE_START = 0.5;
/** Mobile: full opacity shortly after entering portfolio view. */
const PHONE_OVERLAY_FADE_RANGE = 0.08;
/** Tablet/desktop: gradual fade over the second half of page scroll. */
const DESKTOP_OVERLAY_FADE_RANGE = 0.5;

export function getPortfolioOverlayOpacity(
  scrollProgress: number,
  isPhone: boolean,
): number {
  if (scrollProgress <= PORTFOLIO_OVERLAY_FADE_START) return 0;
  const fadeRange = isPhone ? PHONE_OVERLAY_FADE_RANGE : DESKTOP_OVERLAY_FADE_RANGE;
  return Math.min(1, (scrollProgress - PORTFOLIO_OVERLAY_FADE_START) / fadeRange);
}

export function useIsPhoneViewport(): boolean {
  const [isPhone, setIsPhone] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${PHONE_MAX_WIDTH_PX}px)`);
    const update = () => setIsPhone(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  return isPhone;
}
