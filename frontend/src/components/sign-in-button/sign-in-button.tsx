import clsx from "clsx";
import { useState } from "react";
import {
  Button,
  TransitionablePortal,
  Modal,
  Header,
  Grid,
} from "semantic-ui-react";
import { useGoogleAuth } from "../../custom-hooks/api/auth-api";
import styles from "./sign-in-button.module.scss";

function SignInButton() {
  const {
    startGoogleAuth,
    isLoading: googleAuthLoading,
    isUnavailable,
  } = useGoogleAuth();
  const [isSignInOptionsOpened, setSignInOptionsOpened] = useState(false);

  return (
    <div className={styles.signInButtonContainer}>
      <Button
        fluid
        className={clsx(styles.signInButton, styles.important)}
        content="Sign In"
        onClick={() => setSignInOptionsOpened(true)}
      />
      <TransitionablePortal
        open={isSignInOptionsOpened}
        transition={{ animation: "fade down" }}
      >
        <Modal
          open
          onClose={() => setSignInOptionsOpened(false)}
          size="tiny"
          closeIcon
        >
          <Modal.Header as={Header} textAlign="center">
            Sign In Options
          </Modal.Header>
          <Modal.Content>
            <Grid
              columns="2"
              textAlign="center"
              verticalAlign="middle"
              stretched
            >
              <Grid.Column>
                <Button content="Sign in with NUSNET" color="blue" fluid />
              </Grid.Column>
              <Grid.Column>
                <Button
                  onClick={startGoogleAuth}
                  content="Sign in with Google"
                  fluid
                  loading={googleAuthLoading}
                  disabled={isUnavailable}
                />
              </Grid.Column>
            </Grid>
          </Modal.Content>
        </Modal>
      </TransitionablePortal>
    </div>
  );
}

export default SignInButton;
