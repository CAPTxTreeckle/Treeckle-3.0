import { useState, useEffect } from "react";

export default function useShowScroller(showScrollerYOffset?: number) {
  const [showScroller, setShowScroller] = useState(false);

  useEffect(() => {
    if (showScrollerYOffset !== undefined && showScrollerYOffset >= 0) {
      const onScroll = () => {
        if (showScrollerYOffset === undefined) {
          return;
        }

        setShowScroller(window.pageYOffset > showScrollerYOffset);
      };

      onScroll();
      window.addEventListener("scroll", onScroll, { passive: true });
      return () => window.removeEventListener("scroll", onScroll);
    }
  }, [showScrollerYOffset]);

  return { showScroller };
}
