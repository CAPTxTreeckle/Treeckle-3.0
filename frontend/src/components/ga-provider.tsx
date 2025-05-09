import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import ReactGA from "react-ga4";

ReactGA.initialize((import.meta.env.VITE_APP_GA_TRACKING_ID as string) ?? "");

export default function GaProvider() {
  const location = useLocation();

  useEffect(() => {
    if (!location) return;
    ReactGA.set({ page: location.pathname });
    ReactGA.send({ hitType: "pageview", page: location.pathname });
  }, [location]);

  useEffect(() => {
    ReactGA.set({ page: window.location.pathname });
    ReactGA.send({ hitType: "pageview", page: window.location.pathname });
  }, []);

  return <div />;
}
