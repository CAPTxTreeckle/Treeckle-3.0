import { ReactNode } from "react";
import clsx from "clsx";
import styles from "./horizontal-layout-container.module.scss";

type Props = {
  justify?: "start" | "center" | "end" | "between";
  children: ReactNode;
};

function HorizontalLayoutContainer({ children, justify = "start" }: Props) {
  return (
    <div
      className={clsx(styles.horizontalLayoutContainer, {
        [styles.center]: justify === "center",
        [styles.end]: justify === "end",
        [styles.between]: justify === "between",
      })}
    >
      {children}
    </div>
  );
}

export default HorizontalLayoutContainer;
