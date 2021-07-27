import { ReactNode } from "react";
import clsx from "clsx";
import styles from "./full-page-container.module.scss";

type Props = {
  className?: string;
  children?: ReactNode;
};

function FullPageContainer({ className, children }: Props) {
  return (
    <div className={clsx(styles.fullPageContainer, className)}>{children}</div>
  );
}

export default FullPageContainer;
