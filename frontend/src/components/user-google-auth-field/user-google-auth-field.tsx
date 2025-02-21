import { ReactNode } from "react";
import {
  GoogleLoginResponse,
  GoogleLoginResponseOffline,
} from "react-google-login";
import { toast } from "react-toastify";
import { Button, Popup } from "semantic-ui-react";

import { useGoogleAuth } from "../../custom-hooks/api/auth-api";
import { useUpdateSelf } from "../../custom-hooks/api/users-api";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import {
  selectCurrentUserDisplayInfo,
  updateCurrentUserAction,
} from "../../redux/slices/current-user-slice";
import { SelfPatchAction } from "../../types/users";
import { ApiResponseError, resolveApiError } from "../../utils/error-utils";
import HorizontalLayoutContainer from "../horizontal-layout-container";

const LinkButton = () => {
  const dispatch = useAppDispatch();

  const { loading: isLinking, updateSelf } = useUpdateSelf();

  const onLinkGoogle = async (
    response: GoogleLoginResponse | GoogleLoginResponseOffline,
  ) => {
    if (isLinking) {
      return;
    }

    const { tokenId } = response as GoogleLoginResponse;

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
      resolveApiError(error as ApiResponseError);
    }
  };

  const {
    startGoogleAuth,
    loading: googleAuthLoading,
    isAvailable,
  } = useGoogleAuth((res) => {
    onLinkGoogle(res).catch((error) => console.error(error));
  });

  const loading = googleAuthLoading || isLinking;

  return (
    <Popup
      content="Link"
      position="top center"
      size="small"
      trigger={
        <Button
          size="mini"
          compact
          color="blue"
          icon="linkify"
          loading={loading}
          onClick={startGoogleAuth}
          disabled={!isAvailable || loading}
        />
      }
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
      resolveApiError(error as ApiResponseError);
    }
  };

  return (
    <Popup
      content="Unlink"
      position="top center"
      size="small"
      trigger={
        <Button
          size="mini"
          compact
          color="blue"
          icon="unlinkify"
          loading={isUnlinking}
          onClick={() => {
            onUnlinkGoogle().catch((error) => console.error(error));
          }}
          disabled={isUnlinking}
        />
      }
    />
  );
};

type Props = {
  children?: ReactNode;
};

function UserGoogleAuthField({ children }: Props) {
  const { googleAuth } = useAppSelector(selectCurrentUserDisplayInfo) ?? {};

  return (
    <HorizontalLayoutContainer spacing="compact" align="center">
      {children}

      {googleAuth ? (
        <>
          <span>{`(${googleAuth.email})`}</span>
          <UnlinkButton />
        </>
      ) : (
        <LinkButton />
      )}
    </HorizontalLayoutContainer>
  );
}

export default UserGoogleAuthField;
