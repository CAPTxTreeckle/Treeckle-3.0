import { Icon } from "semantic-ui-react";

import BaseModal from "../base-modal";

type Props = {
  open: boolean;
  onExited: () => void;
  onClose: () => void;
};

function BookingCreationShortNoticeWarning({ open, onExited, onClose }: Props) {
  return (
    <BaseModal
      open={open}
      onExited={onExited}
      onClose={onClose}
      title={
        <>
          <Icon name="warning sign" color="orange" />
          Warning
        </>
      }
      content={
        <>
          <p>
            Some of your selected time slots are within the next 3 days, so your
            booking may not be approved in time.
          </p>
          <p>
            Next time, please book at least <strong>2 weeks in advance</strong>.
          </p>
        </>
      }
    />
  );
}

export default BookingCreationShortNoticeWarning;
