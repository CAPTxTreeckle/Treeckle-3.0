import { Button } from "semantic-ui-react";
import { useGoogleAuth } from "../../custom-hooks/api/auth-api";
import styles from "./sign-in-options-section.module.scss";

function SignInOptionsSection() {
  const {
    startGoogleAuth,
    loading: googleAuthLoading,
    isUnavailable,
  } = useGoogleAuth();

  return (
    <div className={styles.signInOptionsSection}>
      <Button content="Sign in with password" icon="key" fluid />

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
    </div>
  );
}

export default SignInOptionsSection;
