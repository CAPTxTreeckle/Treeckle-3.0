import { ReactNode } from "react";
import clsx from "clsx";
import styles from "./horizontal-layout-container.module.scss";

type Props = {
  className?: string;
  justify?: "start" | "center" | "end" | "space between";
  spacing?: "normal" | "compact";
  children: ReactNode;
};

function HorizontalLayoutContainer({
  children,
  className,
  justify = "start",
  spacing = "normal",
}: Props) {
  return (
    <div
      className={clsx(
        styles.horizontalLayoutContainer,
        {
          [styles.center]: justify === "center",
          [styles.end]: justify === "end",
          [styles.spaceBetween]: justify === "space between",
        },
        {
          [styles.normal]: spacing === "normal",
          [styles.compact]: spacing === "compact",
        },
        className,
      )}
    >
      {children}
    </div>
  );
}

export default HorizontalLayoutContainer;
