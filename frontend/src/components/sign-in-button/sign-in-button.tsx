import { useState } from "react";
import { Button, TransitionablePortal, Modal, Header } from "semantic-ui-react";
import SignInOptionsSection from "../sign-in-options-section";
import styles from "./sign-in-button.module.scss";

function SignInButton() {
  const [isSignInOptionsOpened, setSignInOptionsOpened] = useState(false);

  return (
    <div className={styles.signInButtonContainer}>
      <Button
        fluid
        className={styles.signInButton}
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
          size="mini"
          closeIcon
        >
          <Modal.Header as={Header} textAlign="center">
            Sign In Options
          </Modal.Header>
          <Modal.Content>
            <SignInOptionsSection />
          </Modal.Content>
        </Modal>
      </TransitionablePortal>
    </div>
  );
}

export default SignInButton;
