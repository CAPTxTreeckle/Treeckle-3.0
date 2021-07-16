import { Button } from "semantic-ui-react";
import {
  GoogleLoginResponse,
  GoogleLoginResponseOffline,
} from "react-google-login";
import { toast } from "react-toastify";
import { useGoogleAuth, useGoogleLogin } from "../../custom-hooks/api/auth-api";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import {
  selectCurrentUserDisplayInfo,
  updateCurrentUserAction,
} from "../../redux/slices/current-user-slice";
import { resolveApiError } from "../../utils/error-utils";
import HorizontalLayoutContainer from "../horizontal-layout-container";

const LinkButton = () => {
  const dispatch = useAppDispatch();
  const { email } = useAppSelector(selectCurrentUserDisplayInfo) ?? {};

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

      dispatch(updateCurrentUserAction(authData));
    } catch (error) {
      resolveApiError(error);
    }
  };

  const {
    startGoogleAuth,
    loading: googleAuthLoading,
    isAvailable,
  } = useGoogleAuth(onGoogleLogin);

  const loading = googleAuthLoading || isLinking;

  return (
    <Button
      size="mini"
      compact
      color="blue"
      content="Link"
      loading={loading}
      onClick={startGoogleAuth}
      disabled={!isAvailable || loading}
    />
  );
};

type Props = {
  labelClassName?: string;
};

function UserGoogleAuthField({ labelClassName }: Props) {
  const user = useAppSelector(selectCurrentUserDisplayInfo);

  return (
    <HorizontalLayoutContainer align="center">
      <span className={labelClassName}>
        {user?.hasGoogleAuth ? "Linked" : "Not linked"}
      </span>

      <LinkButton />
    </HorizontalLayoutContainer>
  );
}

export default UserGoogleAuthField;
