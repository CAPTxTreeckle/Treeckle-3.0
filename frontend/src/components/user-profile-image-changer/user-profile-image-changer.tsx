import {
  ReactNode,
  useCallback,
  Dispatch,
  SetStateAction,
  useState,
} from "react";
import { useModal } from "react-modal-hook";
import { toast } from "react-toastify";
import { Button, Icon, Popup } from "semantic-ui-react";
import { useUpdateSelf } from "../../custom-hooks/api/users-api";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import {
  selectCurrentUserDisplayInfo,
  updateCurrentUserAction,
} from "../../redux/slices/current-user-slice";
import {
  ProfileImagePayloadPostData,
  SelfPatchAction,
} from "../../types/users";
import { resolveApiError } from "../../utils/error-utils";
import ConfirmationModal from "../confirmation-modal";

type Props = {
  children: ReactNode;
};

function UserProfileImageChanger({ children }: Props) {
  const { profileImage, googleAuth, facebookAuth } =
    useAppSelector(selectCurrentUserDisplayInfo) ?? {};
  const { loading, updateSelf } = useUpdateSelf();
  const [isUploadingGoogleImage, setUploadingGoogleImage] = useState(false);
  const [isUploadingFacebookImage, setUploadingFacebookImage] = useState(false);
  const [isDeletingProfileImage, setDeletingProfileImage] = useState(false);
  const dispatch = useAppDispatch();

  const onChangeProfileImage = useCallback(
    ({
        payload,
        onSuccess,
        setLoading,
      }: {
        payload: ProfileImagePayloadPostData;
        onSuccess?: () => void;
        setLoading?: Dispatch<SetStateAction<boolean>>;
      }) =>
      async () => {
        if (loading) {
          return;
        }

        try {
          setLoading?.(true);

          const updatedSelf = await updateSelf({
            action: SelfPatchAction.ProfileImage,
            payload,
          });

          if (updatedSelf.isSelf) {
            dispatch(updateCurrentUserAction({ user: updatedSelf }));

            onSuccess?.();
          }
        } catch (error) {
          resolveApiError(error);
        } finally {
          setLoading?.(false);
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
        title="Delete Profile Image"
        content="Are you sure you want to delete your profile image?"
        icon={<Icon name="trash alternate outline" />}
        yesButtonProps={{
          loading: isDeletingProfileImage,
          onClick: onChangeProfileImage({
            payload: null,
            onSuccess: () => {
              toast.success(
                "Your profile image has been deleted successfully.",
              );
              hideModal();
            },
            setLoading: setDeletingProfileImage,
          }),
          disabled: isDeletingProfileImage,
        }}
        noButtonProps={{ onClick: hideModal }}
      />
    ),
    [onChangeProfileImage, isDeletingProfileImage],
  );

  const onUploadProfileImage = useCallback(
    ({
      newProfileImage,
      setLoading,
    }: {
      newProfileImage: string;
      setLoading: Dispatch<SetStateAction<boolean>>;
    }) =>
      onChangeProfileImage({
        payload: { profileImage: newProfileImage },
        onSuccess: () =>
          toast.success("Your profile image has been updated successfully."),
        setLoading,
      }),
    [onChangeProfileImage],
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
          />
          {googleAuth?.profileImage && (
            <Button
              icon="google"
              color="google plus"
              content="Use google photo"
              loading={isUploadingGoogleImage}
              disabled={loading}
              onClick={onUploadProfileImage({
                newProfileImage: googleAuth.profileImage,
                setLoading: setUploadingGoogleImage,
              })}
            />
          )}
          {facebookAuth?.profileImage && (
            <Button
              icon="facebook"
              color="facebook"
              content="Use facebook photo"
              loading={isUploadingFacebookImage}
              disabled={loading}
              onClick={onUploadProfileImage({
                newProfileImage: facebookAuth.profileImage,
                setLoading: setUploadingFacebookImage,
              })}
            />
          )}
          {profileImage && (
            <Button
              icon="trash alternate outline"
              color="red"
              content="Delete"
              onClick={showModal}
              loading={isDeletingProfileImage}
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

export default UserProfileImageChanger;
