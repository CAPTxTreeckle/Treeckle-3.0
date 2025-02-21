import { ReactNode } from "react";
import { toast } from "react-toastify";
import { Button, Popup } from "semantic-ui-react";

import { useFacebookAuth } from "../../custom-hooks/api/auth-api";
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

  const onFacebookLogin = async (response: fb.StatusResponse) => {
    const { accessToken } = response.authResponse;

    if (!accessToken) {
      toast.error("Failed to link your facebook account.");
      return;
    }

    try {
      const updatedSelf = await updateSelf({
        action: SelfPatchAction.Facebook,
        payload: { accessToken },
      });

      if (updatedSelf.isSelf) {
        toast.success("Your facebook account has been successfully linked.");

        dispatch(updateCurrentUserAction({ user: updatedSelf }));
      }
    } catch (error) {
      resolveApiError(error as ApiResponseError);
    }
  };

  const { startFacebookAuth } = useFacebookAuth((response) => {
    onFacebookLogin(response).catch((error) => {
      console.log(error);
    });
  });

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
          loading={isLinking}
          onClick={startFacebookAuth}
          disabled={isLinking}
        />
      }
    />
  );
};

const UnlinkButton = () => {
  const dispatch = useAppDispatch();
  const { loading: isUnlinking, updateSelf } = useUpdateSelf();

  const onUnlinkFacebook = async () => {
    if (isUnlinking) {
      return;
    }

    try {
      const updatedSelf = await updateSelf({
        action: SelfPatchAction.Facebook,
        payload: null,
      });

      if (updatedSelf.isSelf) {
        toast.success("Your facebook account has been successfully unlinked.");

        dispatch(updateCurrentUserAction({ user: updatedSelf }));

        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
        window.FB?.getLoginStatus(({ status }: fb.StatusResponse) => {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
          status === "connected" && window.FB?.logout();
        });
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
            onUnlinkFacebook().catch((error) => console.log(error));
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

function UserFacebookAuthField({ children }: Props) {
  const { facebookAuth } = useAppSelector(selectCurrentUserDisplayInfo) ?? {};

  return (
    <HorizontalLayoutContainer spacing="compact" align="center">
      {children}

      {facebookAuth ? (
        <>
          <span>{`(${facebookAuth.email})`}</span>
          <UnlinkButton />
        </>
      ) : (
        <LinkButton />
      )}
    </HorizontalLayoutContainer>
  );
}

export default UserFacebookAuthField;
