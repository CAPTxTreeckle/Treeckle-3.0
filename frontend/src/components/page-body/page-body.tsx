import { forwardRef, ReactNode, Ref } from "react";
import clsx from "clsx";
import styles from "./page-body.module.scss";

type Props = { className?: string; children: ReactNode };

function PageBody({ className, children }: Props, ref: Ref<HTMLDivElement>) {
  return (
    <div ref={ref} className={clsx(styles.pageBody, className)}>
      {children}
    </div>
  );
}

export default forwardRef(PageBody);
