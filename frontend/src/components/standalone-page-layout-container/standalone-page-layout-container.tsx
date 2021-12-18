import { ReactNode } from "react";
import { Link } from "react-router-dom";
import { Button, Container, Segment, Transition } from "semantic-ui-react";

import useScrollToTopScroller from "../../custom-hooks/use-scroll-to-top-scroller";
import { useAppSelector } from "../../redux/hooks";
import { selectIsLoggedIn } from "../../redux/slices/current-user-slice";
import { HOME_PATH } from "../../routes/paths";
import styles from "./standalone-page-layout-container.module.scss";

type Props = {
  children: ReactNode;
};

function StandalonePageLayoutContainer({ children }: Props) {
  const { showScroller, scrollerStyle, scrollToTop } =
    useScrollToTopScroller(300);
  const isLoggedIn = useAppSelector(selectIsLoggedIn);

  return (
    <div className={styles.standalonePageLayoutContainer}>
      {isLoggedIn ? (
        children
      ) : (
        <Container>
          <Segment vertical>
            <Button
              as={Link}
              to={HOME_PATH}
              basic
              content="Home"
              inverted
              icon="chevron left"
            />

            {children}
          </Segment>
        </Container>
      )}

      <Transition visible={showScroller} animation="scale" duration="300">
        <Button
          style={scrollerStyle}
          color="teal"
          onClick={scrollToTop}
          icon="arrow up"
          circular
          size="huge"
          aria-label="scroll to top"
        />
      </Transition>
    </div>
  );
}

export default StandalonePageLayoutContainer;
