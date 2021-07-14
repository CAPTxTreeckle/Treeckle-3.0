import { ReactNode } from "react";
import { Link } from "react-router-dom";
import { Button, Container, Segment, Transition } from "semantic-ui-react";
import { useLastLocation } from "react-router-last-location";
import { HOME_PATH } from "../../routes/paths";
import useScrollToTopScroller from "../../custom-hooks/use-scroll-to-top-scroller";
import styles from "./standalone-page-layout-container.module.scss";

type Props = {
  children: ReactNode;
};

function StandalonePageLayoutContainer({ children }: Props) {
  const lastLocation = useLastLocation();
  const { showScroller, scrollerStyle, scrollToTop } =
    useScrollToTopScroller(300);

  return (
    <div className={styles.standalonePageLayoutContainer}>
      <Container>
        <Segment vertical>
          <Button
            as={Link}
            to={lastLocation?.pathname ?? HOME_PATH}
            basic
            content="Back"
            inverted
            icon="chevron left"
          />

          {children}
        </Segment>
      </Container>

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
