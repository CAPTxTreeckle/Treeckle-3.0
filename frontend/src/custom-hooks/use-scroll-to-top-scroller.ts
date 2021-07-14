import { useState, useEffect, CSSProperties, useContext } from "react";
import { PageBodyContext } from "../components/page-body";

const scrollerStyle: CSSProperties = {
  margin: 0,
  position: "fixed",
  bottom: "8%",
  right: "6%",
  zIndex: 1000,
  boxShadow:
    "0px 3px 5px -1px rgba(0, 0, 0, 0.4), 0px 6px 10px 0px rgba(0, 0, 0, 0.28), 0px 1px 18px 0px rgba(0, 0, 0, 0.24)",
};

export default function useScrollToTopScroller(showScrollerYOffset?: number) {
  const [showScroller, setShowScroller] = useState(false);
  const { body } = useContext(PageBodyContext);

  const scrollToTop = () =>
    body?.scrollTo({ top: 0, left: 0, behavior: "smooth" });

  useEffect(() => {
    if (showScrollerYOffset !== undefined && showScrollerYOffset >= 0) {
      const onScroll = () => {
        if (showScrollerYOffset === undefined || !body) {
          return;
        }

        setShowScroller(
          (body === window ? body.pageYOffset : (body as Element).scrollTop) >
            showScrollerYOffset,
        );
      };

      onScroll();
      body?.addEventListener("scroll", onScroll, { passive: true });
      return () => body?.removeEventListener("scroll", onScroll);
    }
  }, [body, showScrollerYOffset]);

  return { showScroller, scrollerStyle, scrollToTop };
}
