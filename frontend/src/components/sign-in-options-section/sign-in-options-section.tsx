import clsx from "clsx";
import { useContext } from "react";
import {
  GoogleLoginResponse,
  GoogleLoginResponseOffline,
} from "react-google-login";
import { toast } from "react-toastify";
import { Button } from "semantic-ui-react";

import { SignInContext } from "../../contexts/sign-in-provider";
import {
  useFacebookAuth,
  useFacebookLogin,
  useGoogleAuth,
  useGoogleLogin,
} from "../../custom-hooks/api/auth-api";
import { useAppDispatch } from "../../redux/hooks";
import { updateCurrentUserAction } from "../../redux/slices/current-user-slice";
import { resolveApiError } from "../../utils/error-utils";
import styles from "./sign-in-options-section.module.scss";

const PasswordLoginButton = () => {
  const { setPasswordSignIn } = useContext(SignInContext);

  return (
    <Button
      content="Sign in with password"
      icon="key"
      fluid
      onClick={() => setPasswordSignIn(true)}
    />
  );
};

const GoogleLoginButton = () => {
  const dispatch = useAppDispatch();
  const { loading: isLoggingIn, googleLogin } = useGoogleLogin();

  const onGoogleLogin = async (
    response: GoogleLoginResponse | GoogleLoginResponseOffline,
  ) => {
    if (isLoggingIn) {
      return;
    }

    const { tokenId } = response as GoogleLoginResponse;

    try {
      const authData = await googleLogin({ tokenId });

      toast.success("Signed in successfully.");

      dispatch(updateCurrentUserAction(authData));
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      resolveApiError(error);
    }
  };

  const {
    startGoogleAuth,
    loading: googleAuthLoading,
    isAvailable,
  } = useGoogleAuth(onGoogleLogin);

  const loading = isLoggingIn || googleAuthLoading;

  return (
    <Button
      className={styles.googleButton}
      onClick={startGoogleAuth}
      content="Sign in with Google"
      icon={{
        name: "google",
        className: loading ? undefined : styles.icon,
      }}
      fluid
      loading={loading}
      disabled={!isAvailable || loading}
    />
  );
};

const FacebookLoginButton = () => {
  const dispatch = useAppDispatch();
  const { loading: isLoggingIn, facebookLogin } = useFacebookLogin();

  const onFacebookLogin = async (response: fb.StatusResponse) => {
    const { accessToken } = response.authResponse;

    if (!accessToken) {
      throw new Error("Failed to retrieve Facebook access token.");
    }

    try {
      const authData = await facebookLogin({ accessToken });

      toast.success("Signed in successfully.");

      dispatch(updateCurrentUserAction(authData));
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      resolveApiError(error);
    }
  };

  const { startFacebookAuth } = useFacebookAuth(onFacebookLogin);

  return (
    <Button
      icon="facebook"
      color="facebook"
      onClick={startFacebookAuth}
      content="Sign in with Facebook"
      fluid
      loading={isLoggingIn}
      disabled={isLoggingIn}
    />
  );
};

function SignInOptionsSection() {
  return (
    <div className={clsx(styles.signInOptionsSection, styles.important)}>
      <PasswordLoginButton />
      <GoogleLoginButton />
      <FacebookLoginButton />

      {/* <Button
        content="Sign in with NUSNET"
        icon="openid"
        color="blue"
        fluid
        disabled
      /> */}
    </div>
  );
}

export default SignInOptionsSection;
