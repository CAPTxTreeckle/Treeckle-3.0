import { ReactNode } from "react";
import styles from "./full-page-container.module.scss";

type Props = {
  children: ReactNode;
};

function FullPageContainer({ children }: Props) {
  return <div className={styles.fullPageContainer}>{children}</div>;
}

export default FullPageContainer;
