import {

  getTextColorForBackground,

  hexToRgba,

  isLightColor,

} from "@/lib/colorUtils";

import {

  SURFACE_OFF_BLACK,

  SURFACE_OFF_WHITE,

  getSurfaceGlowColor,

  getSurfacePanelBorder,

  getSurfacePanelGlow,

} from "@/lib/systemSurfaceTheme";

import type { CSSProperties } from "react";



export const MODAL_OFF_BLACK = SURFACE_OFF_BLACK;

export const MODAL_OFF_WHITE = SURFACE_OFF_WHITE;



export type AlertModalCustomColors = {

  background: string;

  foreground: string;

  text: string;

  accent: string;

};



export type AlertModalTheme = {

  profileBg: string;

  accent: string;

  modalBg: string;

  textColor: string;

  glowColor: string;

  backdropStyle: CSSProperties;

  panelStyle: CSSProperties;

  titleStyle: CSSProperties;

  bodyStyle: CSSProperties;

  secondaryButtonStyle: CSSProperties;

  primaryButtonStyle: CSSProperties;

  inputStyle: CSSProperties;

};



export function getPrimaryButtonGlow(accent: string): string {

  const glow = isLightColor(accent) ? MODAL_OFF_BLACK : MODAL_OFF_WHITE;

  return [

    `0 0 6px ${hexToRgba(glow, 0.07)}`,

    `0 0 12px ${hexToRgba(glow, 0.07)}`,

  ].join(", ");

}



export function getAlertModalTheme(

  customColors?: Partial<AlertModalCustomColors>,

  prefersDark = false,

): AlertModalTheme {

  const profileBg = customColors?.background ?? MODAL_OFF_WHITE;

  const accent = customColors?.accent ?? "#c96a4a";

  const modalBg = prefersDark ? MODAL_OFF_BLACK : MODAL_OFF_WHITE;

  const textColor = getTextColorForBackground(modalBg);

  const glowColor = getSurfaceGlowColor(modalBg);



  return {

    profileBg,

    accent,

    modalBg,

    textColor,

    glowColor,

    backdropStyle: {

      backgroundColor: hexToRgba(profileBg, 0.85),

    },

    panelStyle: {

      backgroundColor: modalBg,

      opacity: 1,

      border: getSurfacePanelBorder(modalBg),

      boxShadow: getSurfacePanelGlow(modalBg),

    },

    titleStyle: { color: textColor },

    bodyStyle: { color: textColor, opacity: 0.85 },

    secondaryButtonStyle: {

      backgroundColor: hexToRgba(textColor, 0.33),

      color: textColor,

    },

    primaryButtonStyle: {

      backgroundColor: accent,

      color: getTextColorForBackground(accent),

      boxShadow: getPrimaryButtonGlow(accent),

    },

    inputStyle: {

      backgroundColor: hexToRgba(textColor, 0.08),

      border: `1px solid ${hexToRgba(textColor, 0.2)}`,

      color: textColor,

    },

  };

}

