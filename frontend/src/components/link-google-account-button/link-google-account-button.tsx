import { Button } from "semantic-ui-react";
import {
  GoogleLoginResponse,
  GoogleLoginResponseOffline,
} from "react-google-login";
import { toast } from "react-toastify";
import { useGoogleAuth, useGoogleLogin } from "../../custom-hooks/api/auth-api";
import { useAppDispatch } from "../../redux/hooks";
import { setCurrentUserAction } from "../../redux/slices/current-user-slice";
import { resolveApiError } from "../../utils/error-utils";

type Props = {
  email: string;
};

function LinkGoogleAccountButton({ email }: Props) {
  const dispatch = useAppDispatch();
  const { loading: isLinking, googleLogin } = useGoogleLogin();

  const onGoogleLogin = async (
    response: GoogleLoginResponse | GoogleLoginResponseOffline,
  ) => {
    if (isLinking) {
      return;
    }

    const { tokenId, profileObj } = response as GoogleLoginResponse;

    if (email !== profileObj.email) {
      toast.error("Google email does not match with Treeckle account email");
      return;
    }

    try {
      const authData = await googleLogin({ tokenId });

      toast.success("Your google account has been successfully linked.");

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
      size="mini"
      compact
      color="blue"
      content="Link"
      loading={googleAuthLoading || isLinking}
      onClick={startGoogleAuth}
      disabled={!isAvailable || googleAuthLoading || isLinking}
    />
  );
}

export default LinkGoogleAccountButton;
