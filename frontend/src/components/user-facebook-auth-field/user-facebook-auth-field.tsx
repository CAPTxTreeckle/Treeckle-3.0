import { ReactNode } from "react";
import { Button, Popup } from "semantic-ui-react";
import { toast } from "react-toastify";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import {
  selectCurrentUserDisplayInfo,
  updateCurrentUserAction,
} from "../../redux/slices/current-user-slice";
import { useFacebookAuth } from "../../custom-hooks/api/auth-api";
import { useUpdateSelf } from "../../custom-hooks/api/users-api";
import HorizontalLayoutContainer from "../horizontal-layout-container";
import { resolveApiError } from "../../utils/error-utils";
import { SelfPatchAction } from "../../types/users";

const LinkButton = () => {
  const dispatch = useAppDispatch();
  const { loading: isLinking, updateSelf } = useUpdateSelf();

  const onFacebookLogin = async (response: fb.StatusResponse) => {
    const { accessToken } = response.authResponse;

    try {
      const updatedSelf = await updateSelf({
        action: SelfPatchAction.Facebook,
        payload: { accessToken },
      });

      if (updatedSelf.isSelf) {
        toast.success("Your facebook account has been successfully linked.");

        dispatch(updateCurrentUserAction({ user: updatedSelf }));
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      resolveApiError(error);
    }
  };

  const { startFacebookAuth } = useFacebookAuth(onFacebookLogin);

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

        window.FB?.getLoginStatus(({ status }) => {
          status === "connected" && window.FB?.logout();
        });
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      resolveApiError(error);
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
          onClick={onUnlinkFacebook}
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
