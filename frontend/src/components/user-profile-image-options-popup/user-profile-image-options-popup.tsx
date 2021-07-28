import { ReactNode, useCallback } from "react";
import { useModal } from "react-modal-hook";
import { toast } from "react-toastify";
import { Button, Icon, Popup } from "semantic-ui-react";
import { useUpdateSelf } from "../../custom-hooks/api/users-api";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import {
  selectCurrentUserDisplayInfo,
  updateCurrentUserAction,
} from "../../redux/slices/current-user-slice";
import { SelfPatchAction } from "../../types/users";
import { resolveApiError } from "../../utils/error-utils";
import ConfirmationModal from "../confirmation-modal";

type Props = {
  children: ReactNode;
  setSelectedImage: (selectedImage?: string | null) => void;
};

function UserProfileImageOptionsPopup({ children, setSelectedImage }: Props) {
  const { profileImage, googleAuth, facebookAuth } =
    useAppSelector(selectCurrentUserDisplayInfo) ?? {};
  const { loading, updateSelf } = useUpdateSelf();
  const dispatch = useAppDispatch();

  const onDeleteProfileImage = useCallback(
    (hideModal: () => void) => async () => {
      if (loading) {
        return;
      }

      try {
        const updatedSelf = await updateSelf({
          action: SelfPatchAction.ProfileImage,
          payload: null,
        });

        if (updatedSelf.isSelf) {
          dispatch(updateCurrentUserAction({ user: updatedSelf }));

          toast.success("Your profile photo has been deleted successfully.");
          hideModal();
        }
      } catch (error) {
        resolveApiError(error);
      }
    },
    [loading, updateSelf, dispatch],
  );

  const [showModal, hideModal] = useModal(
    ({ in: open, onExited }) => (
      <ConfirmationModal
        open={open}
        onExited={onExited}
        onClose={hideModal}
        title="Delete Profile Photo"
        content="Are you sure you want to delete your profile photo?"
        icon={<Icon name="trash alternate outline" />}
        yesButtonProps={{
          loading,
          onClick: onDeleteProfileImage(hideModal),
          disabled: loading,
        }}
        noButtonProps={{ onClick: hideModal }}
      />
    ),
    [onDeleteProfileImage, loading],
  );

  return (
    <Popup
      position="bottom center"
      content={
        <Button.Group vertical>
          <Button
            icon="camera"
            content={`${
              profileImage ? "Change photo" : "Upload photo"
            } (coming soon)`}
            disabled={loading}
            onClick={() => setSelectedImage(null)}
          />
          {googleAuth?.profileImage && (
            <Button
              icon="google"
              color="google plus"
              content="Use google photo"
              disabled={loading}
              onClick={() => setSelectedImage(googleAuth.profileImage)}
            />
          )}
          {facebookAuth?.profileImage && (
            <Button
              icon="facebook"
              color="facebook"
              content="Use facebook photo"
              disabled={loading}
              onClick={() => setSelectedImage(facebookAuth.profileImage)}
            />
          )}
          {profileImage && (
            <Button
              icon="trash alternate outline"
              color="red"
              content="Delete"
              onClick={showModal}
              loading={loading}
              disabled={loading}
            />
          )}
        </Button.Group>
      }
      hoverable
      trigger={children}
      on="click"
    />
  );
}

export default UserProfileImageOptionsPopup;
