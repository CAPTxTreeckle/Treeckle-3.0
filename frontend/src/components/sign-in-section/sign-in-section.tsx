import { useContext } from "react";
import { Header, Modal } from "semantic-ui-react";

import { SignInContext } from "../../contexts/sign-in-provider";
import { LoginDetails } from "../../types/auth";
import SignInAccountForm from "../sign-in-account-form";
import SignInEmailForm from "../sign-in-email-form";
import SignInOptionsSection from "../sign-in-options-section";
import SignInOtherOptionsLink from "../sign-in-other-options-link";
import SignInPasswordResetLink from "../sign-in-password-reset-link";
import styles from "./sign-in-section.module.scss";

const getTitleAndSection = (
  isPasswordSignIn: boolean,
  loginDetails?: LoginDetails,
) => {
  if (!isPasswordSignIn) {
    return { title: "Sign In Options", section: <SignInOptionsSection /> };
  }

  if (!loginDetails) {
    return {
      title: "Sign In",
      section: <SignInEmailForm />,
    };
  }

  const { name } = loginDetails;

  return {
    title: name ? `Hi ${name}` : "Create New Account",
    section: <SignInAccountForm />,
  };
};

function SignInSection() {
  const { isPasswordSignIn, loginDetails } = useContext(SignInContext);

  const { title, section } = getTitleAndSection(isPasswordSignIn, loginDetails);

  return (
    <>
      <Modal.Header as={Header} textAlign="center" className={styles.headerRow}>
        <span>{title}</span>
        <div className={styles.tooltipContainer}>
          <span className={styles.tooltipIcon}>i</span>
          <span className={styles.tooltipText}>Log in with your NUS email first, to link your Google account under your profile.</span>
        </div>
      </Modal.Header>
      <Modal.Content className={styles.signInSection}>
        {section}
        {isPasswordSignIn && (
          <div className="center-text">
            <SignInOtherOptionsLink />
            <br />
            {loginDetails?.name && <SignInPasswordResetLink />}
          </div>
        )}
      </Modal.Content>
    </>
  );
}

export default SignInSection;
