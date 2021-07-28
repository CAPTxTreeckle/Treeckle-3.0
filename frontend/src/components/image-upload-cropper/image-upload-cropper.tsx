import {
  Dispatch,
  Ref,
  SetStateAction,
  useEffect,
  useState,
  forwardRef,
  useImperativeHandle,
} from "react";
import { Image } from "semantic-ui-react";
import FileUploader from "../file-uploader";
import ImageCropper from "../image-cropper";

const IMAGE_FILE_TYPES = ["image/jpeg", "image/png", "image/gif"];

type ImageUploadCropperHandle = {
  setOriginalImage: Dispatch<SetStateAction<string | undefined>>;
};

type Props = {
  croppedImage?: string;
  onCroppedImageChange?: (croppedImage?: string) => void;
  onOriginalImageChange?: (originalImage?: string) => void;
  imagePreviewControlsRenderer?: () => JSX.Element;
} & Omit<
  Parameters<typeof ImageCropper>[0],
  "image" | "onCropImage" | "onCancel"
>;

function ImageUploadCropper(
  {
    croppedImage,
    onCroppedImageChange,
    onOriginalImageChange,
    imagePreviewControlsRenderer: ImagePreviewControls = () => <div>Test</div>,
    ...cropperProps
  }: Props,
  ref: Ref<ImageUploadCropperHandle>,
) {
  const [_originalImage, _setOriginalImage] = useState<string>();
  const [_croppedImage, _setCroppedImage] = useState<string>();

  useImperativeHandle(
    ref,
    () => ({
      // use original setter to prevent possible call loop with onOriginalImageChange
      setOriginalImage: _setOriginalImage,
    }),
    [],
  );

  const setOriginalImage = (originalImage?: string) => {
    _setOriginalImage(originalImage);
    onOriginalImageChange?.(originalImage);
  };

  const setCroppedImage = (croppedImage?: string) => {
    _setCroppedImage(croppedImage);
    onCroppedImageChange?.(croppedImage);
  };

  useEffect(() => {
    _setCroppedImage(croppedImage);
  }, [croppedImage]);

  const onAcceptImageFile = (files: File[]) => {
    const imageFile = files[0];

    if (!imageFile) {
      return;
    }

    const fileReader = new FileReader();
    fileReader.onload = (e) => {
      const data = e.target?.result as string;
      if (data) {
        setOriginalImage(data);
      }
    };
    fileReader.readAsDataURL(imageFile);
  };

  const renderView = () => {
    if (_croppedImage) {
      return (
        <>
          <Image
            fluid
            src={_croppedImage}
            alt=""
            centered
            rounded={cropperProps.cropShape !== "round"}
            circular={cropperProps.cropShape === "round"}
          />
          <ImagePreviewControls />
        </>
      );
    }

    if (_originalImage) {
      return (
        <ImageCropper
          image={_originalImage}
          onCropImage={setCroppedImage}
          onCancel={() => setOriginalImage()}
          {...cropperProps}
        />
      );
    }

    return (
      <FileUploader
        onAcceptFiles={onAcceptImageFile}
        accept={IMAGE_FILE_TYPES}
        maxFileSize={2000000}
        title="Drag and drop, or click here to upload image."
        description="Maximum accepted image size is 2MB."
      />
    );
  };

  return renderView();
}

export default forwardRef(ImageUploadCropper);
