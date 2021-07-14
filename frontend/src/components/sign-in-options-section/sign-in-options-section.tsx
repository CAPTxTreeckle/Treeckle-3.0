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
    isAvailable,
  } = useGoogleAuth(onGoogleLogin);

  return (
    <Button
      className={styles.googleButton}
      onClick={startGoogleAuth}
      content="Sign in with Google"
      icon={googleAuthLoading ? undefined : "google"}
      fluid
      loading={googleAuthLoading || loading}
      disabled={!isAvailable || googleAuthLoading || loading}
    />
  );
};

const FacebookLoginButton = () => {
  const dispatch = useAppDispatch();
  const { loading, facebookLogin } = useFacebookLogin();

  const onFacebookLogin = async (response: fb.StatusResponse) => {
    if (response.status === "not_authorized") {
      toast.error("No permission to access required info from Facebook.");
      return;
    }
    if (response.status !== "connected") {
      return;
    }

    const grantedScopes = response.authResponse.grantedScopes?.split(",") ?? [];

    if (
      !grantedScopes.includes("public_profile") ||
      !grantedScopes.includes("email")
    ) {
      toast.error(
        `No permission to access ${
          grantedScopes.includes("public_profile") ? "email" : "public profile"
        } from Facebook.`,
      );
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

  return (
    <Button
      icon="facebook"
      color="facebook"
      onClick={startFacebookAuth}
      content="Sign in with Facebook"
      fluid
      loading={facebookAuthLoading || loading}
      disabled={facebookAuthLoading || loading}
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
