import Cropper from "react-easy-crop";
import { Divider, Button, Popup } from "semantic-ui-react";
import HorizontalLayoutContainer from "../horizontal-layout-container";
import useImageCropperState from "../../custom-hooks/use-image-cropper-state";
import styles from "./image-cropper.module.scss";

const DEFAULT_ASPECT_RATIO = 4 / 3;

type Props = {
  image: string;
  aspectRatio?: number;
  onCropImage: (croppedImage: string) => Promise<unknown> | void;
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
        />
      </div>

      <Divider />

      <HorizontalLayoutContainer spacing="compact" justify="center">
        {onCancel && (
          <Popup
            content="Cancel"
            position="top center"
            trigger={
              <Button
                className={styles.actionButton}
                icon="times"
                color="red"
                onClick={onCancel}
                disabled={isCropping}
              />
            }
          />
        )}
        <Popup
          content="Reset"
          position="top center"
          trigger={
            <Button
              className={styles.actionButton}
              icon="redo alternate"
              secondary
              onClick={reset}
              disabled={isCropping}
            />
          }
        />

        <Popup
          content="Confirm"
          position="top center"
          trigger={
            <Button
              className={styles.actionButton}
              icon="checkmark"
              color="green"
              onClick={onCropConfirm}
              loading={isCropping}
              disabled={isCropping}
            />
          }
        />
      </HorizontalLayoutContainer>
    </div>
  );
}

export default ImageCropper;
