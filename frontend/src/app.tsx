import { Provider as ReduxProvider } from "react-redux";
import { toast, Zoom } from "react-toastify";
import axios from "axios";
import { configure } from "axios-hooks";
import { TransitionGroup } from "react-transition-group";
import { ModalProvider } from "react-modal-hook";
import store from "./redux/store";
// import "semantic-ui-css/semantic.min.css";
import "react-toastify/dist/ReactToastify.min.css";
import LocalStorageUserManager from "./managers/local-storage-user-manager";
import LocalStorageBookingCreationManager from "./managers/local-storage-booking-creation-manager";
import PendingBookingCountManager from "./managers/pending-booking-count-manager";
import Routes from "./routes";
import styles from "./app.module.scss";

toast.configure({
  position: "bottom-center",
  autoClose: 4000,
  limit: 3,
  transition: Zoom,
  bodyClassName: styles.toastBody,
  toastClassName: styles.toast,
  theme: "colored",
});

configure({ axios: axios.create({ baseURL: process.env.REACT_APP_API_URL }) });

function App() {
  return (
    <ReduxProvider store={store}>
      <ModalProvider rootComponent={TransitionGroup}>
        <LocalStorageUserManager />
        <LocalStorageBookingCreationManager />
        <PendingBookingCountManager />
        <Routes />
      </ModalProvider>
    </ReduxProvider>
  );
}

export default App;
