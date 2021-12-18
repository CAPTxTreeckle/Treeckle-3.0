import clsx from "clsx";
import { ReactNode } from "react";

import styles from "./horizontal-layout-container.module.scss";

type Props = {
  className?: string;
  justify?: "start" | "center" | "end" | "space between";
  spacing?: "normal" | "compact";
  align?: "center";
  children: ReactNode;
};

function HorizontalLayoutContainer({
  children,
  className,
  justify = "start",
  spacing = "normal",
  align,
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
        {
          [styles.alignCenter]: align === "center",
        },
        className,
      )}
    >
      {children}
    </div>
  );
}

export default HorizontalLayoutContainer;
