import { ReactNode } from "react";
import clsx from "clsx";
import { Segment, Loader, LoaderProps } from "semantic-ui-react";
import styles from "./placeholder-wrapper.module.scss";

type Props = {
  children?: ReactNode;
  isLoading?: boolean;
  loadingMessage?: string;
  showDefaultMessage?: boolean;
  defaultMessage?: string;
  inverted?: boolean;
  placeholder?: boolean;
  size?: LoaderProps["size"];
};

function PlaceholderWrapper({
  children = null,
  isLoading = false,
  loadingMessage,
  showDefaultMessage = false,
  defaultMessage,
  inverted = false,
  placeholder = false,
  size = "huge",
}: Props) {
  return isLoading || showDefaultMessage ? (
    <Segment
      className={styles.placeholderWrapper}
      basic
      placeholder={placeholder}
      textAlign="center"
    >
      {isLoading && (
        <Loader
          size={size}
          active
          inverted={inverted}
          inline
          content={
            <div className={clsx(styles.message, inverted && styles.inverted)}>
              {loadingMessage}
            </div>
          }
        />
      )}
      {!isLoading && showDefaultMessage && defaultMessage && (
        <div className={clsx(styles.message, inverted && styles.inverted)}>
          {defaultMessage}
        </div>
      )}
    </Segment>
  ) : (
    <>{children}</>
  );
}

export default PlaceholderWrapper;
