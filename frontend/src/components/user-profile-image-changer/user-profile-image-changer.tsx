import { ElementRef, useRef, ReactNode, useState, useEffect } from "react";
import ImageUploadCropper from "../image-upload-cropper";
import UserProfileImageOptionsPopup from "../user-profile-image-options-popup";

type Props = {
  children: ReactNode;
};

function UserProfileImageChanger({ children }: Props) {
  const [selectedImage, setSelectedImage] = useState<string | null>();
  const imageUploadCropperRef =
    useRef<ElementRef<typeof ImageUploadCropper>>(null);

  useEffect(() => {
    if (selectedImage !== null) {
      imageUploadCropperRef.current?.setOriginalImage(selectedImage);
    }
  }, [selectedImage]);

  return selectedImage !== undefined ? (
    <ImageUploadCropper
      ref={imageUploadCropperRef}
      aspectRatio={1}
      onOriginalImageChange={setSelectedImage}
    />
  ) : (
    <UserProfileImageOptionsPopup setSelectedImage={setSelectedImage}>
      {children}
    </UserProfileImageOptionsPopup>
  );
}

export default UserProfileImageChanger;
