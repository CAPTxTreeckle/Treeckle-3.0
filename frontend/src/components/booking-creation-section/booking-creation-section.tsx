import { ReactNode, useRef, useEffect } from "react";
import {
  Segment,
  Progress,
  TransitionablePortal,
  Modal,
  Button,
} from "semantic-ui-react";
import { useModal } from "react-modal-hook";
import { BookingCreationStep } from "../../types/bookings";
import BookingCreationHelpButton from "../booking-creation-help-button";
import BookingCreationCategorySelector from "../booking-creation-category-selector";
import BookingCreationVenueSelector from "../booking-creation-venue-selector";
import BookingCreationTimeSlotSelector from "../booking-creation-time-slot-selector";
import BookingCreationCustomForm from "../booking-creation-custom-form";
import BookingCreationFinalizeView from "../booking-creation-finalize-view";
import HorizontalLayoutContainer from "../horizontal-layout-container";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import {
  resetBookingCreationAction,
  selectCurrentCreationStep,
} from "../../redux/slices/booking-creation-slice";
import styles from "./booking-creation-section.module.scss";

const BOOKING_CREATION_STEP_DETAILS = new Map<
  BookingCreationStep,
  {
    headerContent: string;
    component: ReactNode;
  }
>([
  [
    BookingCreationStep.Category,
    {
      headerContent: "Step 1: Choose a venue category",
      component: <BookingCreationCategorySelector />,
    },
  ],
  [
    BookingCreationStep.Venue,
    {
      headerContent: "Step 2: Select a venue",
      component: <BookingCreationVenueSelector />,
    },
  ],
  [
    BookingCreationStep.TimeSlot,
    {
      headerContent: "Step 3: Select your booking period(s)",
      component: <BookingCreationTimeSlotSelector />,
    },
  ],
  [
    BookingCreationStep.Form,
    {
      headerContent: "Step 4: Fill up the booking form",
      component: <BookingCreationCustomForm />,
    },
  ],
  [
    BookingCreationStep.Finalize,
    {
      headerContent: "Step 5: Review & submit",
      component: <BookingCreationFinalizeView />,
    },
  ],
]);

const AlertExistingBookingModal = ({
  open,
  onExited,
  hideModal,
}: {
  open: boolean;
  onExited: () => void;
  hideModal: () => void;
}) => {
  const dispatch = useAppDispatch();

  return (
    <TransitionablePortal
      transition={{ animation: "fade down" }}
      open={open}
      onHide={onExited}
    >
      <Modal size="tiny" basic open onClose={hideModal}>
        <Modal.Header align="center">Draft Booking Found</Modal.Header>

        <Modal.Content>
          <Modal.Description>
            You have an unsubmitted draft booking. Do you want to continue?
          </Modal.Description>
        </Modal.Content>

        <Modal.Actions>
          <Button
            onClick={() => {
              hideModal();
              dispatch(resetBookingCreationAction());
            }}
            basic
            color="red"
            inverted
            icon="times"
            content="No"
          />
          <Button
            onClick={hideModal}
            basic
            color="green"
            inverted
            icon="checkmark"
            content="Yes"
          />
        </Modal.Actions>
      </Modal>
    </TransitionablePortal>
  );
};

function BookingCreationSection() {
  const currentCreationStep = useAppSelector(selectCurrentCreationStep);
  const { headerContent, component } = {
    ...BOOKING_CREATION_STEP_DETAILS.get(currentCreationStep),
  };
  const hasIncompletedBookingsRef = useRef(
    currentCreationStep !== BookingCreationStep.Category,
  );

  const [showModal, hideModal] = useModal(({ in: open, onExited }) => (
    <AlertExistingBookingModal
      open={open}
      onExited={onExited}
      hideModal={hideModal}
    />
  ));

  useEffect(() => {
    if (hasIncompletedBookingsRef.current) {
      showModal();
    }
  }, [showModal]);

  return (
    <Segment.Group className={styles.bookingCreationSection} raised>
      <Segment>
        <h2>
          <HorizontalLayoutContainer>
            <div>{headerContent}</div>
            <BookingCreationHelpButton />
          </HorizontalLayoutContainer>
        </h2>
      </Segment>
      <Segment className={styles.progressBarContainer}>
        <Progress
          className={styles.progressBar}
          size="small"
          indicating
          total={BookingCreationStep.__length - 1}
          value={currentCreationStep}
        />
      </Segment>

      {component}
    </Segment.Group>
  );
}

export default BookingCreationSection;
