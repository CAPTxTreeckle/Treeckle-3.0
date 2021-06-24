import { memo } from "react";
import { useModal } from "react-modal-hook";
import { Button, Modal, Popup, TransitionablePortal } from "semantic-ui-react";
import { useAppSelector } from "../../redux/hooks";
import { selectSelectedVenue } from "../../redux/slices/booking-creation-slice";
import { VenueViewProps } from "../../types/venues";
import LinkifyTextViewer from "../linkify-text-viewer";

const HelpModal = ({
  open,
  onExited,
  hideModal,
  selectedVenue,
}: {
  open: boolean;
  onExited: () => void;
  hideModal: () => void;
  selectedVenue: VenueViewProps | null;
}) => {
  const {
    name: venueName,
    icName,
    icEmail,
    icContactNumber,
  } = {
    ...selectedVenue?.venueFormProps,
  };

  return (
    <TransitionablePortal
      transition={{ animation: "fade down" }}
      open={open}
      onHide={onExited}
    >
      <Modal size="tiny" closeIcon open onClose={hideModal}>
        <LinkifyTextViewer>
          <Modal.Header>{`${venueName} Help Info`}</Modal.Header>

          <Modal.Content>
            <h3>For any queries, do contact:</h3>

            {icName || icEmail || icContactNumber ? (
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
              </>
            ) : (
              <p>
                <strong>Email:</strong> treeckle@googlegroups.com
              </p>
            )}
          </Modal.Content>
        </LinkifyTextViewer>
      </Modal>
    </TransitionablePortal>
  );
};

function BookingCreationHelpButton() {
  const selectedVenue = useAppSelector(selectSelectedVenue);

  const [showModal, hideModal] = useModal(
    ({ in: open, onExited }) => (
      <HelpModal
        open={open}
        onExited={onExited}
        hideModal={hideModal}
        selectedVenue={selectedVenue}
      />
    ),
    [selectedVenue],
  );

  return selectedVenue ? (
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
    />
  ) : null;
}

export default memo(BookingCreationHelpButton);
