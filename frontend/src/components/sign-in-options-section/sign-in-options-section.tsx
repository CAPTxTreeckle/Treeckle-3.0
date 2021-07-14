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
  useGoogleAuth,
  useGoogleLogin,
} from "../../custom-hooks/api/auth-api";
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
    isAvailable,
  } = useGoogleAuth(onGoogleLogin);

  const { startFacebookAuth, loading: facebookAuthLoading } = useFacebookAuth(
    (response) => console.log(response),
  );

  return (
    <div className={clsx(styles.signInOptionsSection, styles.important)}>
      <Button
        content="Sign in with password"
        icon="key"
        fluid
        onClick={() => setPasswordSignIn(true)}
      />

      <Button
        className={styles.googleButton}
        onClick={startGoogleAuth}
        content="Sign in with Google"
        icon={googleAuthLoading ? undefined : "google"}
        fluid
        loading={googleAuthLoading || loading}
        disabled={!isAvailable || googleAuthLoading || loading}
      />

      <Button
        icon="facebook"
        color="facebook"
        onClick={startFacebookAuth}
        content="Sign in with Facebook"
        fluid
        loading={facebookAuthLoading}
        disabled={facebookAuthLoading || true}
      />

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
