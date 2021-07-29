import { ReactNode, useCallback } from "react";
import { toast } from "react-toastify";
import { Button, Divider } from "semantic-ui-react";
import { useUpdateSelf } from "../../custom-hooks/api/users-api";
import useImageUploadCropperState from "../../custom-hooks/use-image-upload-cropper-state";
import { useAppDispatch } from "../../redux/hooks";
import { updateCurrentUserAction } from "../../redux/slices/current-user-slice";
import { SelfPatchAction } from "../../types/users";
import { resolveApiError } from "../../utils/error-utils";
import FileUploader from "../file-uploader";
import HorizontalLayoutContainer from "../horizontal-layout-container";
import ImageCropper from "../image-cropper";
import UserProfileImageOptionsPopup from "../user-profile-image-options-popup";

const IMAGE_FILE_TYPES = ["image/jpeg", "image/png", "image/gif"];

type Props = {
  children: ReactNode;
};

function UserProfileImageChanger({ children }: Props) {
  const { updateSelf } = useUpdateSelf();
  const dispatch = useAppDispatch();
  const { originalImage, setOriginalImage, onAcceptImageFile } =
    useImageUploadCropperState();

  const onUploadProfileImage = useCallback(
    async (newProfileImage: string) => {
      try {
        const updatedSelf = await updateSelf({
          action: SelfPatchAction.ProfileImage,
          payload: { profileImage: newProfileImage },
        });

        if (updatedSelf.isSelf) {
          dispatch(updateCurrentUserAction({ user: updatedSelf }));
          setOriginalImage(undefined);

          toast.success("Your profile photo has been updated successfully.");
        }
      } catch (error) {
        resolveApiError(error);
      }
    },
    [updateSelf, setOriginalImage, dispatch],
  );

  const renderView = () => {
    if (originalImage === undefined) {
      return (
        <UserProfileImageOptionsPopup setSelectedImage={setOriginalImage}>
          {children}
        </UserProfileImageOptionsPopup>
      );
    }

    if (originalImage === null) {
      return (
        <>
          <FileUploader
            onAcceptFiles={onAcceptImageFile}
            accept={IMAGE_FILE_TYPES}
            maxFileSize={1000000}
            title="Drag and drop, or click here to upload photo."
            description="Maximum accepted photo size is 1MB."
          />

          <Divider />

          <HorizontalLayoutContainer justify="center">
            <Button
              color="red"
              icon="times"
              content="Cancel"
              onClick={() => setOriginalImage(undefined)}
            />
          </HorizontalLayoutContainer>
        </>
      );
    }

    return (
      <ImageCropper
        image={originalImage}
        onCropImage={onUploadProfileImage}
        onCancel={() => setOriginalImage(undefined)}
        aspectRatio={1}
        cropShape="round"
      />
    );
  };

  return renderView();
}

export default UserProfileImageChanger;
