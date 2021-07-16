import { useState } from "react";
import { Button } from "semantic-ui-react";
import axios from "axios";
import { toast } from "react-toastify";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import {
  selectCurrentUserDisplayInfo,
  updateCurrentUserAction,
} from "../../redux/slices/current-user-slice";
import { useFacebookAuth } from "../../custom-hooks/api/auth-api";
import { useUpdateSelf } from "../../custom-hooks/api/users-api";
import HorizontalLayoutContainer from "../horizontal-layout-container";
import { errorHandlerWrapper, resolveApiError } from "../../utils/error-utils";
import { SelfPatchAction } from "../../types/users";

const LinkButton = () => {
  const dispatch = useAppDispatch();
  const { email } = useAppSelector(selectCurrentUserDisplayInfo) ?? {};
  const [isLinking, setLinking] = useState(false);
  const { updateSelf } = useUpdateSelf();

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
      setLinking(true);

      const { data } = await errorHandlerWrapper(() =>
        axios.get<{ email: string }>(
          `https://graph.facebook.com/me?fields=email&access_token=${accessToken}`,
        ),
      )();

      if (data.email !== email) {
        toast.error(
          "Facebook email does not match with Treeckle account email.",
        );
        return;
      }

      const updatedSelf = await updateSelf({
        action: SelfPatchAction.Facebook,
        payload: { accessToken },
      });

      if (updatedSelf.isSelf) {
        toast.success("Your facebook account has been successfully linked.");

        dispatch(updateCurrentUserAction({ user: updatedSelf }));
      }
    } catch (error) {
      resolveApiError(error);
    } finally {
      setLinking(false);
    }
  };

  const { startFacebookAuth } = useFacebookAuth(onFacebookLogin);

  return (
    <Button
      size="mini"
      compact
      color="blue"
      content="Link"
      loading={isLinking}
      onClick={startFacebookAuth}
      disabled={isLinking}
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
      onClick={onUnlinkFacebook}
      disabled={isUnlinking}
    />
  );
};

type Props = {
  labelClassName?: string;
};

function UserFacebookAuthField({ labelClassName }: Props) {
  const user = useAppSelector(selectCurrentUserDisplayInfo);

  return (
    <HorizontalLayoutContainer align="center">
      <span className={labelClassName}>
        {user?.hasFacebookAuth ? "Linked" : "Not linked"}
      </span>

      {user?.hasFacebookAuth ? <UnlinkButton /> : <LinkButton />}
    </HorizontalLayoutContainer>
  );
}

export default UserFacebookAuthField;
