import { useCallback, useState } from "react";
import { Area, Point } from "react-easy-crop/types";

export default function useImageCropperState({
  image,
  onCropImage,
}: {
  image: string;
  onCropImage: (croppedImage: string) => void;
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
      const croppedImage = image;
      // TODO: implement crop loic
      //   (await getCroppedImage(image, croppedAreaPixels)) ?? "";
      onCropImage(croppedImage);
    } catch (error) {
      console.log(error, error?.response);
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
