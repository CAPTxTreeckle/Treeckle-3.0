import { useContext, useEffect } from "react";
import { useHistory } from "react-router-dom";
import { PageBodyContext } from "../../components/page-body";

type Props = {
  paths?: string[];
};

function ScrollToTopManager({ paths }: Props) {
  const { body } = useContext(PageBodyContext);
  const history = useHistory();

  useEffect(() => {
    if (!body) {
      return;
    }

    const unlisten = history.listen((location) => {
      if (!paths || paths.includes(location.pathname)) {
        body.scrollTo({ top: 0, left: 0, behavior: "auto" });
      }
    });

    return unlisten;
  }, [body, history, paths]);

  return null;
}

export default ScrollToTopManager;
