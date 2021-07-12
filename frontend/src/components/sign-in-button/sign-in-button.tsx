import { useState } from "react";
import { Button, TransitionablePortal, Modal } from "semantic-ui-react";
import SignInSection from "../sign-in-section";
import SignInProvider from "../../contexts/sign-in-provider";
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
          <SignInProvider>
            <SignInSection />
          </SignInProvider>
        </Modal>
      </TransitionablePortal>
    </div>
  );
}

export default SignInButton;
