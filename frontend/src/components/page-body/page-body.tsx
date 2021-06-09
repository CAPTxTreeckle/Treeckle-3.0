import { forwardRef, ReactNode, Ref } from "react";
import classNames from "classnames";
import styles from "./page-body.module.scss";

type Props = { className?: string; children: ReactNode };

function PageBody({ className, children }: Props, ref: Ref<HTMLDivElement>) {
  return (
    <div ref={ref} className={classNames(styles.pageBody, className)}>
      {children}
    </div>
  );
}

export default forwardRef(PageBody);
