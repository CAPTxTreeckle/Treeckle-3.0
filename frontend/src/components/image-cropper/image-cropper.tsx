import Cropper from "react-easy-crop";
import { Divider, Button } from "semantic-ui-react";
import HorizontalLayoutContainer from "../horizontal-layout-container";
import useImageCropperState from "../../custom-hooks/use-image-cropper-state";
import styles from "./image-cropper.module.scss";

const DEFAULT_ASPECT_RATIO = 4 / 3;

type Props = {
  image: string;
  aspectRatio?: number;
  onCropImage: (croppedImage: string) => void;
  onCancel?: () => void;
  showGrid?: boolean;
  cropShape?: "rect" | "round";
  restrictPosition?: boolean;
  minZoom?: number;
  maxZoom?: number;
};

function ImageCropper({
  image,
  aspectRatio = DEFAULT_ASPECT_RATIO,
  onCropImage,
  onCancel,
  showGrid = false,
  cropShape = "rect",
  restrictPosition = true,
  minZoom,
  maxZoom,
}: Props) {
  const {
    crop,
    zoom,
    onCropChange,
    onZoomChange,
    onCropComplete,
    onCropConfirm,
    reset,
    isCropping,
  } = useImageCropperState({ image, onCropImage });

  return (
    <div>
      <div
        style={{ aspectRatio: `${aspectRatio}` }}
        className={styles.imageCropperWrapper}
      >
        <Cropper
          image={image}
          crop={crop}
          zoom={zoom}
          onCropChange={onCropChange}
          onZoomChange={onZoomChange}
          onCropComplete={onCropComplete}
          aspect={aspectRatio}
          restrictPosition={restrictPosition}
          showGrid={showGrid}
          cropShape={cropShape}
          minZoom={minZoom}
          maxZoom={maxZoom}
          onMediaLoaded={(mediaSize) => console.log(mediaSize)}
        />
      </div>

      <Divider />

      <HorizontalLayoutContainer spacing="compact" justify="center">
        {onCancel && (
          <Button
            type="button"
            icon="close"
            color="red"
            content="Cancel"
            onClick={onCancel}
          />
        )}
        <Button
          type="button"
          icon="repeat"
          secondary
          content="Reset"
          onClick={reset}
        />
        <Button
          type="button"
          icon="checkmark"
          color="green"
          content="Confirm"
          onClick={onCropConfirm}
          loading={isCropping}
        />
      </HorizontalLayoutContainer>
    </div>
  );
}

export default ImageCropper;
