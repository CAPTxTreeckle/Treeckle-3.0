import { Icon } from "semantic-ui-react";

import BaseModal from "../base-modal";
import LinkifyTextViewer from "../linkify-text-viewer";

type Props = {
  open: boolean;
  onExited: () => void;
  onClose: () => void;
  title: string;
  message: string;
};

function BookingCreationShortNoticeWarning({
  open,
  onExited,
  onClose,
  title,
  message,
}: Props) {
  return (
    <BaseModal
      open={open}
      onExited={onExited}
      onClose={onClose}
      title={
        <>
          <Icon name="warning sign" color="orange" />
          {title}
        </>
      }
      content={
        <div className="text-viewer">
          <LinkifyTextViewer>{message}</LinkifyTextViewer>
        </div>
      }
    />
  );
}

export default BookingCreationShortNoticeWarning;
