import { ReactNode } from "react";
import styles from "./page-body.module.scss";

type Props = { children: ReactNode };

function PageBody({ children }: Props) {
  return <div className={styles.pageBody}>{children}</div>;
}

export default PageBody;
