import clsx from "clsx";
import { useDropzone } from "react-dropzone";
import { Header, Icon } from "semantic-ui-react";

import styles from "./file-uploader.module.scss";

type Props = {
  accept?: string | string[];
  multiple?: boolean;
  onAcceptFiles: (files: File[]) => void;
  maxFileSize?: number;
  icon?: React.ReactNode;
  title?: string;
  description?: string;
  disabled?: boolean;
};

function FileUploader({
  accept,
  multiple = false,
  onAcceptFiles,
  maxFileSize,
  icon = <Icon name="file alternate" />,
  title = "Drag and drop, or click here to upload file.",
  description,
  disabled,
}: Props) {
  const { getRootProps, getInputProps, isFocused, isDragAccept, isDragReject } =
    useDropzone({
      accept,
      multiple,
      onDropAccepted: onAcceptFiles,
      maxSize: maxFileSize,
      disabled,
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
