import { ReactNode } from "react";
import styles from "./horizontal-layout-container.module.scss";

type Props = {
  children: ReactNode;
};

function HorizontalLayoutContainer({ children }: Props) {
  return <div className={styles.horizontalLayoutContainer}>{children}</div>;
}

export default HorizontalLayoutContainer;
