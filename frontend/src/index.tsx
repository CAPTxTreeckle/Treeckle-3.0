import "./configs";
import "./index.scss";

import { StrictMode } from "react";
import ReactDOM from "react-dom";
import ReactGA from "react-ga";

import App from "./app";
import reportWebVitals from "./reportWebVitals";

ReactGA.initialize(process.env.GA_TRACKING_ID ?? "");
ReactDOM.render(
  <StrictMode>
    <App />
  </StrictMode>,
  document.getElementById("root"),
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals(() =>
  ReactGA.pageview(window.location.pathname + window.location.search),
);
