import { ReactNode } from "react";
import clsx from "clsx";
import { Menu } from "semantic-ui-react";
import styles from "./top-bar.module.scss";

type Props = {
  children: ReactNode;
};

function TopBar({ children }: Props) {
  return (
    <Menu
      className={clsx(styles.topBar, styles.important)}
      borderless
      size="huge"
    >
      {children}
    </Menu>
  );
}

export default TopBar;
