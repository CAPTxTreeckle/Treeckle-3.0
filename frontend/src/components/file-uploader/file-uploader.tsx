import clsx from "clsx";
import { DropzoneOptions, useDropzone } from "react-dropzone";
import { Header, Icon } from "semantic-ui-react";

import styles from "./file-uploader.module.scss";

type Props = {
  icon?: React.ReactNode;
  title?: string;
  description?: string;
} & DropzoneOptions;

function FileUploader({
  icon = <Icon name="file alternate" />,
  title = "Drag and drop, or click here to upload file.",
  description,
  multiple = false,
  ...dropzoneOptions
}: Props) {
  const { getRootProps, getInputProps, isFocused, isDragAccept, isDragReject } =
    useDropzone({
      multiple,
      ...dropzoneOptions,
    });

  return (
    <div
      {...getRootProps({
        className: clsx(styles.fileUploader, {
          [styles.focused]: isFocused,
          [styles.accepted]: isDragAccept,
          [styles.rejected]: isDragReject,
        }),
      })}
    >
      <input {...getInputProps()} />
      <Header icon>
        {icon}
        {title}
      </Header>
      {description && (
        <p className={styles.description}>
          <strong>{description}</strong>
        </p>
      )}
    </div>
  );
}

export default FileUploader;
