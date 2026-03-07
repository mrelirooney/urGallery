"use client";

import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
  type ReactNode,
} from "react";

type FrostedKey = "nav" | "footer" | "compact";

type ContextValue = {
  isHovered: boolean;
  getRefCallback: (key: FrostedKey) => (el: HTMLElement | null) => void;
  onMouseEnter: (key: FrostedKey) => void;
  onMouseLeave: (key: FrostedKey, relatedTarget: EventTarget | null) => void;
};

const FrostedGlassHoverContext = createContext<ContextValue | null>(null);

export function FrostedGlassHoverProvider({ children }: { children: ReactNode }) {
  const [isHovered, setIsHovered] = useState(false);
  const refs = useRef<Record<FrostedKey, HTMLElement | null>>({
    nav: null,
    footer: null,
    compact: null,
  });

  const getRefCallback = useCallback((key: FrostedKey) => {
    return (el: HTMLElement | null) => {
      refs.current[key] = el;
    };
  }, []);

  const isInsideAny = useCallback((target: Node | null): boolean => {
    if (!target || !(target instanceof Node)) return false;
    for (const el of Object.values(refs.current)) {
      if (el?.contains(target)) return true;
    }
    return false;
  }, []);

  const onMouseEnter = useCallback((_key: FrostedKey) => {
    setIsHovered(true);
  }, []);

  const onMouseLeave = useCallback(
    (_key: FrostedKey, relatedTarget: EventTarget | null) => {
      if (isInsideAny(relatedTarget as Node | null)) return;
      setIsHovered(false);
    },
    [isInsideAny]
  );

  const value: ContextValue = {
    isHovered,
    getRefCallback,
    onMouseEnter,
    onMouseLeave,
  };

  return (
    <FrostedGlassHoverContext.Provider value={value}>
      {children}
    </FrostedGlassHoverContext.Provider>
  );
}

export function useFrostedGlassHover() {
  const ctx = useContext(FrostedGlassHoverContext);
  return ctx;
}
