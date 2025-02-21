import { useCallback, useState } from "react";
import { Area, Point } from "react-easy-crop/types";

import {
  ApiResponseError,
  errorHandlerWrapper,
  resolveApiError,
} from "../utils/error-utils";
import { getCroppedImage } from "../utils/image-utils";

export default function useImageCropperState({
  image,
  onCropImage,
}: {
  image: string;
  onCropImage: (croppedImage: string) => Promise<unknown> | void;
}) {
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixes] = useState<Area>();
  const [isCropping, setCropping] = useState(false);

  const reset = useCallback(() => {
    setCrop({ x: 0, y: 0 });
    setZoom(1);
  }, []);

  const onCropComplete = useCallback(
    (_: Area, croppedAreaPixels: Area) =>
      setCroppedAreaPixes(croppedAreaPixels),
    [],
  );

  const onCropConfirm = useCallback(async () => {
    if (!croppedAreaPixels || !image) {
      return;
    }

    try {
      setCropping(true);
      const croppedImage =
        (await errorHandlerWrapper(
          () => getCroppedImage({ src: image, croppedAreaPixels }),
          {
            logMessageLabel: "Crop image error:",
            defaultErrorMessage:
              "An error has occurred while cropping the image.",
          },
        )()) ?? "";

      await onCropImage(croppedImage);
    } catch (error) {
      resolveApiError(error as ApiResponseError);
    } finally {
      setCropping(false);
    }
  }, [croppedAreaPixels, onCropImage, image]);

  return {
    crop,
    zoom,
    onCropChange: setCrop,
    onZoomChange: setZoom,
    onCropComplete,
    onCropConfirm,
    reset,
    isCropping,
  };
}
