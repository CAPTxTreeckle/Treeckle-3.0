import { useEffect } from "react";
import { useHistory } from "react-router-dom";

type Props = {
  paths?: string[];
};

function ScrollToTopManager({ paths }: Props) {
  const history = useHistory();

  useEffect(() => {
    const unlisten = history.listen((location) => {
      if (!paths || paths.includes(location.pathname)) {
        window.scrollTo({ top: 0, left: 0, behavior: "auto" });
      }
    });

    return unlisten;
  }, [history, paths]);

  return null;
}

export default ScrollToTopManager;
