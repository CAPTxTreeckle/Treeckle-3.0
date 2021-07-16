import { useContext } from "react";
import clsx from "clsx";
import { toast } from "react-toastify";
import { Button } from "semantic-ui-react";
import {
  GoogleLoginResponse,
  GoogleLoginResponseOffline,
} from "react-google-login";
import { SignInContext } from "../../contexts/sign-in-provider";
import {
  useFacebookAuth,
  useFacebookLogin,
  useGoogleAuth,
  useGoogleLogin,
} from "../../custom-hooks/api/auth-api";
import { useAppDispatch } from "../../redux/hooks";
import { setCurrentUserAction } from "../../redux/slices/current-user-slice";
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

      dispatch(setCurrentUserAction(authData));
    } catch (error) {
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
      icon={loading ? undefined : "google"}
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
    if (response.status === "not_authorized") {
      toast.error("No permission to access required info from Facebook.");
      return;
    }
    if (response.status !== "connected") {
      return;
    }

    const { accessToken } = response.authResponse;

    try {
      const authData = await facebookLogin({ accessToken });

      toast.success("Signed in successfully.");

      dispatch(setCurrentUserAction(authData));
    } catch (error) {
      resolveApiError(error);
    }
  };

  const { startFacebookAuth, loading: facebookAuthLoading } =
    useFacebookAuth(onFacebookLogin);

  const loading = isLoggingIn || facebookAuthLoading;

  return (
    <Button
      icon="facebook"
      color="facebook"
      onClick={startFacebookAuth}
      content="Sign in with Facebook"
      fluid
      loading={loading}
      disabled={loading}
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
