import clsx from "clsx";
import { ReactNode } from "react";
import { Dimmer, Loader, Segment, SemanticSIZES } from "semantic-ui-react";

import styles from "./placeholder-wrapper.module.scss";

type Props = {
  className?: string;
  children?: ReactNode;
  loading?: boolean;
  loadingMessage?: string;
  showDefaultMessage?: boolean;
  defaultMessage?: ReactNode | (() => ReactNode);
  inverted?: boolean;
  placeholder?: boolean;
  size?: SemanticSIZES;
  dimmed?: boolean;
  fillParent?: boolean;
};

function PlaceholderWrapper({
  className,
  children = null,
  loading = false,
  loadingMessage,
  showDefaultMessage = false,
  defaultMessage,
  inverted = false,
  placeholder = false,
  size = "huge",
  dimmed = false,
  fillParent = false,
}: Props) {
  return loading || showDefaultMessage ? (
    <Segment
      className={clsx(
        styles.placeholderWrapper,
        fillParent && styles.fillParent,
        className,
      )}
      basic
      placeholder={placeholder}
      textAlign="center"
    >
      <Dimmer className={styles.dimmer} active={dimmed} />

      {loading && (
        <Loader
          size={size}
          active
          inverted={inverted || dimmed}
          inline
          content={
            <div
              className={clsx(
                styles.message,
                (inverted || dimmed) && styles.inverted,
              )}
            >
              {loadingMessage}
            </div>
          }
        />
      )}

      {!loading && showDefaultMessage && defaultMessage && (
        <div
          className={clsx(
            styles.message,
            (inverted || dimmed) && styles.inverted,
          )}
        >
          {typeof defaultMessage === "function"
            ? defaultMessage()
            : defaultMessage}
        </div>
      )}
    </Segment>
  ) : (
    <>{children}</>
  );
}

export default PlaceholderWrapper;
