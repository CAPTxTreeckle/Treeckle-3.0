import { useEffect } from "react";
import { useLocation, RouteComponentProps } from "react-router-dom";
import ReactGA from "react-ga";

ReactGA.initialize(process.env.REACT_APP_GA_TRACKING_ID ?? "");

export default function GaProvider() {
  const location = useLocation();

  useEffect(() => {
    if (!location) return;
    ReactGA.set({ page: location.pathname });
    ReactGA.pageview(location.pathname);
  }, [location]);

  useEffect(() => {
    ReactGA.set({ page: window.location.pathname });
    ReactGA.pageview(window.location.pathname);
  }, []);

  return <div />;
}
