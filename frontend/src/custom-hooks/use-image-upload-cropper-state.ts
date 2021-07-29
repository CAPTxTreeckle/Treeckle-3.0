import { useCallback, useState } from "react";

export default function useImageUploadCropperState() {
  const [originalImage, setOriginalImage] = useState<string | null>();
  const [croppedImage, setCroppedImage] = useState<string>();

  const onAcceptImageFile = useCallback((files: File[]) => {
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
  }, []);

  return {
    originalImage,
    croppedImage,
    setOriginalImage,
    setCroppedImage,
    onAcceptImageFile,
  };
}
