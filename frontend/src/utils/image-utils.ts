import { Area } from "react-easy-crop/types";

function createImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", (error) => reject(error));
    image.crossOrigin = "Anonymous";
    image.src = src;
  });
}

function getRadianAngle(degreeValue: number) {
  return (degreeValue * Math.PI) / 180;
}

export async function getCroppedImage({
  src,
  croppedAreaPixels,
  rotation = 0,
  imageType = "image/jpeg",
}: {
  src: string;
  croppedAreaPixels: Area;
  rotation?: number;
  imageType?: string;
}) {
  const image = await createImage(src);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    return;
  }

  const maxSize = Math.max(image.width, image.height);
  const safeArea = 2.5 * maxSize;

  // set each dimensions to double largest dimension to allow for a safe area for the
  // image to rotate in without being clipped by canvas context
  canvas.width = safeArea;
  canvas.height = safeArea;

  // translate canvas context to a central location on image to allow rotating around the center.
  ctx.translate(safeArea / 2, safeArea / 2);
  ctx.rotate(getRadianAngle(rotation));
  ctx.translate(-safeArea / 2, -safeArea / 2);

  // fill canvas bg with white
  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // draw rotated image and store data.
  ctx.drawImage(
    image,
    safeArea / 2 - image.width * 0.5,
    safeArea / 2 - image.height * 0.5,
  );
  const imageData = ctx.getImageData(0, 0, safeArea, safeArea);

  // set canvas width to final desired crop size - this will clear existing context
  canvas.width = croppedAreaPixels.width;
  canvas.height = croppedAreaPixels.height;

  // paste generated rotate image with correct offsets for x,y crop values.
  ctx.putImageData(
    imageData,
    Math.round(0 - safeArea / 2 + image.width * 0.5 - croppedAreaPixels.x),
    Math.round(0 - safeArea / 2 + image.height * 0.5 - croppedAreaPixels.y),
  );

  return canvas.toDataURL(imageType);
}
