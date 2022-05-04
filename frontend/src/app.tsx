import "semantic-ui-css/semantic.min.css";
import "react-toastify/dist/ReactToastify.min.css";

import axios from "axios";
import { configure } from "axios-hooks";
import { ModalProvider } from "react-modal-hook";
import { Provider as ReduxProvider } from "react-redux";
import { ToastContainer, Zoom } from "react-toastify";
import { TransitionGroup } from "react-transition-group";

import styles from "./app.module.scss";
import LocalStorageBookingCreationManager from "./managers/local-storage-booking-creation-manager";
import LocalStorageUserManager from "./managers/local-storage-user-manager";
import PendingBookingCountManager from "./managers/pending-booking-count-manager";
import store from "./redux/store";
import Routes from "./routes";

configure({ axios: axios.create({ baseURL: process.env.REACT_APP_API_URL }) });

function App() {
  return (
    <ReduxProvider store={store}>
      <ModalProvider rootComponent={TransitionGroup}>
        <ToastContainer
          position="bottom-center"
          autoClose={4000}
          limit={3}
          transition={Zoom}
          bodyClassName={styles.toastBody}
          toastClassName={styles.toast}
          theme="colored"
        />
        <LocalStorageUserManager />
        <LocalStorageBookingCreationManager />
        <PendingBookingCountManager />
        <Routes />
      </ModalProvider>
    </ReduxProvider>
  );
}

export default App;
