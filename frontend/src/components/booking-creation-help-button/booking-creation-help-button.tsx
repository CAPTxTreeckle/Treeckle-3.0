import { useModal } from "react-modal-hook";
import { Button, Popup } from "semantic-ui-react";

import { useAppSelector } from "../../redux/hooks";
import { selectSelectedVenue } from "../../redux/slices/booking-creation-slice";
import BaseModal from "../base-modal";
import LinkifyTextViewer from "../linkify-text-viewer";

function BookingCreationHelpButton() {
  const selectedVenue = useAppSelector(selectSelectedVenue);
  const {
    name: venueName,
    icName,
    icEmail,
    icContactNumber,
    icTelegramHandle,
  } = selectedVenue?.venueFormProps ?? {};

  const [showModal, hideModal] = useModal(
    ({ in: open, onExited }: { in: boolean; onExited: () => void }) => (
      <BaseModal
        open={open}
        onExited={onExited}
        onClose={hideModal}
        title={`${venueName} Help Info`}
        content={
          <LinkifyTextViewer>
            <h3>For any queries, do contact:</h3>

            {icName || icEmail || icContactNumber || icTelegramHandle ? (
              <>
                {icName && (
                  <p>
                    <strong>Name:</strong> {icName}
                  </p>
                )}
                {icEmail && (
                  <p>
                    <strong>Email:</strong> {icEmail}
                  </p>
                )}
                {icContactNumber && (
                  <p>
                    <strong>Contact Number:</strong> {icContactNumber}
                  </p>
                )}
                {icTelegramHandle && (
                  <p>
                    <strong>Telegram:</strong>{" "}
                    <a
                      href={`https://t.me/${icTelegramHandle}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      @{icTelegramHandle}
                    </a>
                  </p>
                )}
              </>
            ) : (
              <p>
                <strong>Email:</strong> treeckle@googlegroups.com
              </p>
            )}
          </LinkifyTextViewer>
        }
      />
    ),
    [venueName, icName, icEmail, icContactNumber, icTelegramHandle],
  );

  return (
    selectedVenue && (
      <Popup
        trigger={
          <Button
            icon="help"
            color="black"
            circular
            compact
            onClick={showModal}
          />
        }
        position="top center"
        content="Help"
        hideOnScroll
      />
    )
  );
}

export default BookingCreationHelpButton;
