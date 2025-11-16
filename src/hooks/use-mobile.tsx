import * as React from "react";

const MOBILE_BREAKPOINT = 768;

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined);

  React.useEffect(() => {
    if (typeof window === "undefined") return;

    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    const onChange = () => {
      setIsMobile(mql.matches);
    };

    // Set initial value from media query
    setIsMobile(mql.matches);

    // Safari/iOS support: older versions use addListener/removeListener
    if ("addEventListener" in mql) {
      mql.addEventListener("change", onChange);
      return () => {
        mql.removeEventListener("change", onChange);
      };
    } else if ("addListener" in mql) {
      (mql as any).addListener(onChange);
      return () => {
        (mql as any).removeListener(onChange);
      };
    } else {
      // Fallback: listen to window resize
      window.addEventListener("resize", onChange);
      return () => window.removeEventListener("resize", onChange);
    }
  }, []);

  return !!isMobile;
}
