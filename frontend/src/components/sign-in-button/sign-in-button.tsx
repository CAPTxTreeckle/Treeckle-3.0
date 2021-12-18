import clsx from "clsx";
import { useState } from "react";
import { Button, Modal, TransitionablePortal } from "semantic-ui-react";

import SignInProvider from "../../contexts/sign-in-provider";
import SignInSection from "../sign-in-section";
import styles from "./sign-in-button.module.scss";

function SignInButton() {
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
