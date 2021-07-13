import { useContext } from "react";
import clsx from "clsx";
import { toast } from "react-toastify";
import { Button } from "semantic-ui-react";
import {
  GoogleLoginResponse,
  GoogleLoginResponseOffline,
} from "react-google-login";
import { SignInContext } from "../../contexts/sign-in-provider";
import { useGoogleAuth, useGoogleLogin } from "../../custom-hooks/api/auth-api";
import { useAppDispatch } from "../../redux/hooks";
import { setCurrentUserAction } from "../../redux/slices/current-user-slice";
import { resolveApiError } from "../../utils/error-utils";
import styles from "./sign-in-options-section.module.scss";

function SignInOptionsSection() {
  const dispatch = useAppDispatch();
  const { setPasswordSignIn } = useContext(SignInContext);
  const { loading, googleLogin } = useGoogleLogin();

  const onGoogleLogin = async (
    response: GoogleLoginResponse | GoogleLoginResponseOffline,
  ) => {
    if (loading) {
      return;
    }

    const { tokenId } = response as GoogleLoginResponse;

    try {
      const authData = await googleLogin({ tokenId });

      toast.success("Signed in successfully.");

      dispatch(setCurrentUserAction(authData));
    } catch (error) {
      resolveApiError(error);
    }
  };

  const {
    startGoogleAuth,
    loading: googleAuthLoading,
    isUnavailable,
  } = useGoogleAuth(onGoogleLogin);

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
        loading={googleAuthLoading || loading}
        disabled={isUnavailable || googleAuthLoading || loading}
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
