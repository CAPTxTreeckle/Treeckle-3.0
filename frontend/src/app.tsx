import { Provider } from "react-redux";
import { toast, Zoom } from "react-toastify";
import axios from "axios";
import { configure } from "axios-hooks";
import { TransitionGroup } from "react-transition-group";
import { ModalProvider } from "react-modal-hook";
import store from "./redux/store";
import "semantic-ui-css/semantic.min.css";
import "react-toastify/dist/ReactToastify.min.css";
import LocalStorageUserManager from "./components/local-storage-user-manager";
import LocalStorageBookingCreationManager from "./components/local-storage-booking-creation-manager";
import Routes from "./routes";
import styles from "./app.module.scss";

toast.configure({
  position: "bottom-center",
  autoClose: 4000,
  limit: 3,
  transition: Zoom,
  bodyClassName: styles.toastBody,
});

configure({ axios: axios.create({ baseURL: process.env.REACT_APP_API_URL }) });

function App() {
  return (
    <div className={styles.app}>
      <Provider store={store}>
        <ModalProvider rootComponent={TransitionGroup}>
          <LocalStorageUserManager />
          <LocalStorageBookingCreationManager />
          <Routes />
        </ModalProvider>
      </Provider>
    </div>
  );
}

export default App;
