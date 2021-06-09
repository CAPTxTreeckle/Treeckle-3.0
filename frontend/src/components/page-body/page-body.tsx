import { forwardRef, ReactNode, Ref } from "react";
import styles from "./page-body.module.scss";

type Props = { children: ReactNode };

function PageBody({ children }: Props, ref: Ref<HTMLDivElement>) {
  return (
    <div ref={ref} className={styles.pageBody}>
      {children}
    </div>
  );
}

export default forwardRef(PageBody);
