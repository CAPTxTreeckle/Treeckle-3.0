import { useContext } from "react";
import clsx from "clsx";
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
        className={clsx(styles.googleButton, styles.important)}
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

      <Button
        content="Sign in with NUSNET"
        icon="openid"
        color="blue"
        fluid
        disabled
      />
    </>
  );
}

export default SignInOptionsSection;
