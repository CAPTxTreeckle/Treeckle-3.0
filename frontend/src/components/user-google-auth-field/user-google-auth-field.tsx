import { Button } from "semantic-ui-react";
import {
  GoogleLoginResponse,
  GoogleLoginResponseOffline,
} from "react-google-login";
import { toast } from "react-toastify";
import { useGoogleAuth } from "../../custom-hooks/api/auth-api";
import { useUpdateSelf } from "../../custom-hooks/api/users-api";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import {
  selectCurrentUserDisplayInfo,
  updateCurrentUserAction,
} from "../../redux/slices/current-user-slice";
import { resolveApiError } from "../../utils/error-utils";
import HorizontalLayoutContainer from "../horizontal-layout-container";
import { SelfPatchAction } from "../../types/users";

const LinkButton = () => {
  const dispatch = useAppDispatch();
  const { email } = useAppSelector(selectCurrentUserDisplayInfo) ?? {};

  const { loading: isLinking, updateSelf } = useUpdateSelf();

  const onLinkGoogle = async (
    response: GoogleLoginResponse | GoogleLoginResponseOffline,
  ) => {
    if (isLinking) {
      return;
    }

    const { tokenId, profileObj } = response as GoogleLoginResponse;

    if (email !== profileObj.email) {
      toast.error("Google email does not match with Treeckle account email.");
      return;
    }

    try {
      const updatedSelf = await updateSelf({
        action: SelfPatchAction.Google,
        payload: { tokenId },
      });

      if (updatedSelf.isSelf) {
        toast.success("Your google account has been successfully linked.");

        dispatch(updateCurrentUserAction({ user: updatedSelf }));
      }
    } catch (error) {
      resolveApiError(error);
    }
  };

  const {
    startGoogleAuth,
    loading: googleAuthLoading,
    isAvailable,
  } = useGoogleAuth(onLinkGoogle);

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

const UnlinkButton = () => {
  const dispatch = useAppDispatch();
  const { loading: isUnlinking, updateSelf } = useUpdateSelf();

  const onUnlinkGoogle = async () => {
    if (isUnlinking) {
      return;
    }

    try {
      const updatedSelf = await updateSelf({
        action: SelfPatchAction.Google,
        payload: null,
      });

      if (updatedSelf.isSelf) {
        toast.success("Your google account has been successfully unlinked.");

        dispatch(updateCurrentUserAction({ user: updatedSelf }));
      }
    } catch (error) {
      resolveApiError(error);
    }
  };

  return (
    <Button
      size="mini"
      compact
      color="blue"
      content="Unlink"
      loading={isUnlinking}
      onClick={onUnlinkGoogle}
      disabled={isUnlinking}
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

      {user?.hasGoogleAuth ? <UnlinkButton /> : <LinkButton />}
    </HorizontalLayoutContainer>
  );
}

export default UserGoogleAuthField;
