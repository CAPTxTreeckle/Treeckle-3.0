import { Provider } from "react-redux";
import { toast, Zoom } from "react-toastify";
import axios from "axios";
import { configure } from "axios-hooks";
import store from "./redux/store";
import "semantic-ui-css/semantic.min.css";
import "react-toastify/dist/ReactToastify.min.css";
import LocalStorageUserManager from "./components/local-storage-user-manager";
import Routes from "./routes";
import styles from "./app.module.scss";

toast.configure({
  position: "bottom-center",
  autoClose: 4000,
  limit: 3,
  transition: Zoom,
  bodyClassName: styles.toastBody,
});

configure({ axios: axios.create({ baseURL: process.env.API_URL }) });

function App() {
  return (
    <Provider store={store}>
      <LocalStorageUserManager />
      <Routes />
    </Provider>
  );
}

export default App;
