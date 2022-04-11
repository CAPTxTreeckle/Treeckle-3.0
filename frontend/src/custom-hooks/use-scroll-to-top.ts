import { useContext, useEffect } from "react";
import { PageBodyContext } from "../components/page-body";

export default function useScrollToTop() {
  const { body } = useContext(PageBodyContext);

  useEffect(() => {
    body?.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [body]);
}
