import os
from typing import Optional
from uuid import uuid4

from imagekitio import ImageKit

imagekit = ImageKit(
    private_key=os.getenv("IMAGEKIT_PRIVATE_KEY"),
    public_key=os.getenv("IMAGEKIT_PUBLIC_KEY"),
    url_endpoint=os.getenv("IMAGEKIT_URL"),
)

# References:
# - https://docs.imagekit.io/api-reference/upload-file-api/server-side-file-upload
# - https://pypi.org/project/imagekitio/


def delete_image(image_id: str) -> None:
    if not image_id:
        return

    imagekit.delete_file(image_id)


def upload_image(base64_image: str, filename: Optional[str] = None) -> tuple[str, str]:
    if not base64_image:
        return "", ""

    image_name = filename if filename else str(uuid4())
    _, image_file = base64_image.split(":", 1)

    data = imagekit.upload(file=image_file, file_name=image_name).get("response", {})
    image_url = data.get("url", "")
    image_id = data.get("fileId", "")

    return image_id, image_url
