import { useContext } from "react";
import { Button } from "semantic-ui-react";
import { SignInContext } from "../../contexts/sign-in-provider";
import { useGoogleAuth } from "../../custom-hooks/api/auth-api";
import styles from "./sign-in-options-section.module.scss";

function SignInOptionsSection() {
  const { setPasswordSignIn } = useContext(SignInContext);
  const {
    startGoogleAuth,
    loading: googleAuthLoading,
    isUnavailable,
  } = useGoogleAuth();

  return (
    <>
      <Button
        content="Sign in with password"
        icon="key"
        fluid
        onClick={() => setPasswordSignIn(true)}
      />

      <Button
        content="Sign in with NUSNET"
        icon="openid"
        color="blue"
        fluid
        disabled
      />

      <Button
        className={styles.googleButton}
        onClick={startGoogleAuth}
        content="Sign in with Google"
        icon={googleAuthLoading ? undefined : "google"}
        fluid
        loading={googleAuthLoading}
        disabled={isUnavailable || googleAuthLoading}
      />

      <Button
        icon="facebook"
        color="facebook"
        content="Sign in with Facebook"
        fluid
        disabled
      />
    </>
  );
}

export default SignInOptionsSection;
