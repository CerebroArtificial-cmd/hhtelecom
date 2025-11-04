// shadcn-ui/src/hooks/use-mobile.tsx
import * as React from "react";

type Breakpoints = {
  mobile: number;   // < mobile => mobile
  tablet: number;   // < tablet => tablet
  // >= tablet => desktop
};

type Options = {
  breakpoints?: Breakpoints;
};

const DEFAULT_BREAKPOINTS: Breakpoints = {
  mobile: 768,
  tablet: 1024,
};

function getViewportSize() {
  // visualViewport reflete melhor zoom/teclado no mobile
  if (typeof window !== "undefined" && window.visualViewport) {
    return {
      width: Math.round(window.visualViewport.width),
      height: Math.round(window.visualViewport.height),
    };
  }
  if (typeof window !== "undefined") {
    return {
      width: Math.round(window.innerWidth),
      height: Math.round(window.innerHeight),
    };
  }
  return { width: 0, height: 0 };
}

function getIsTouch() {
  if (typeof window === "undefined") return false;
  // pointer: coarse → telas de toque (mobile/tablet)
  return window.matchMedia?.("(pointer: coarse)")?.matches ?? false;
}

export function useResponsive(opts?: Options) {
  const bp = opts?.breakpoints ?? DEFAULT_BREAKPOINTS;

  const [state, setState] = React.useState(() => {
    const { width, height } = getViewportSize();
    const dpr =
      typeof window !== "undefined" ? window.devicePixelRatio ?? 1 : 1;
    const isLandscape = width > height;
    const isTouch = getIsTouch();

    return {
      width,
      height,
      dpr,
      isLandscape,
      isTouch,
      isMobile: width < bp.mobile,
      isTablet: width >= bp.mobile && width < bp.tablet,
      isDesktop: width >= bp.tablet,
    };
  });

  React.useEffect(() => {
    if (typeof window === "undefined") return;

    let raf = 0;
    const update = () => {
      const { width, height } = getViewportSize();
      const dpr = window.devicePixelRatio ?? 1;
      const isLandscape = width > height;
      const isTouch = getIsTouch();

      setState((prev) => {
        // evita re-render se nada mudou
        if (
          prev.width === width &&
          prev.height === height &&
          prev.dpr === dpr &&
          prev.isLandscape === isLandscape &&
          prev.isTouch === isTouch
        ) {
          return prev;
        }
        return {
          width,
          height,
          dpr,
          isLandscape,
          isTouch,
          isMobile: width < bp.mobile,
          isTablet: width >= bp.mobile && width < bp.tablet,
          isDesktop: width >= bp.tablet,
        };
      });
    };

    const onChange = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(update);
    };

    // ouvintes relevantes
    window.addEventListener("resize", onChange, { passive: true });
    window.addEventListener("orientationchange", onChange);

    // iOS/Android: mudanças sutis quando teclado abre/fecha
    const vv = window.visualViewport;
    vv?.addEventListener("resize", onChange);
    vv?.addEventListener("scroll", onChange); // teclado pode “empurrar” o viewport

    // inicial
    onChange();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onChange);
      window.removeEventListener("orientationchange", onChange);
      vv?.removeEventListener("resize", onChange);
      vv?.removeEventListener("scroll", onChange);
    };
  }, [bp.mobile, bp.tablet]);

  return state;
}

// Versão simples compatível com seu código antigo:
export function useIsMobile() {
  const { isMobile } = useResponsive();
  return isMobile;
}

