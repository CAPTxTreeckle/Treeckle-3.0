import { ReactNode, useState } from "react";
import ImageCropper from "../image-cropper";
import UserProfileImageOptionsPopup from "../user-profile-image-options-popup";

type Props = {
  children: ReactNode;
};

function UserProfileImageChanger({ children }: Props) {
  const [selectedImage, setSelectedImage] = useState<string | null>();

  return selectedImage !== undefined ? (
    <ImageCropper
      image={selectedImage ?? ""}
      aspectRatio={1}
      onCancel={() => setSelectedImage(undefined)}
      onCropImage={(image) => console.log(image)}
    />
  ) : (
    <UserProfileImageOptionsPopup setSelectedImage={setSelectedImage}>
      {children}
    </UserProfileImageOptionsPopup>
  );
}

export default UserProfileImageChanger;
