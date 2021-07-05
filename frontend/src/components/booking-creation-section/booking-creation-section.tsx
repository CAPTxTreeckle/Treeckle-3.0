import { ReactNode, useRef, useEffect } from "react";
import { Segment, Progress } from "semantic-ui-react";
import { useModal } from "react-modal-hook";
import { BookingCreationStep } from "../../types/bookings";
import BookingCreationHelpButton from "../booking-creation-help-button";
import BookingCreationCategorySelector from "../booking-creation-category-selector";
import BookingCreationVenueSelector from "../booking-creation-venue-selector";
import BookingCreationTimeSlotSelector from "../booking-creation-time-slot-selector";
import BookingCreationCustomForm from "../booking-creation-custom-form";
import BookingCreationFinalizeView from "../booking-creation-finalize-view";
import HorizontalLayoutContainer from "../horizontal-layout-container";
import ConfirmationModal from "../confirmation-modal";
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

function BookingCreationSection() {
  const currentCreationStep = useAppSelector(selectCurrentCreationStep);
  const dispatch = useAppDispatch();
  const { headerContent, component } =
    BOOKING_CREATION_STEP_DETAILS.get(currentCreationStep) ?? {};
  const hasIncompletedBookingsRef = useRef(
    currentCreationStep !== BookingCreationStep.Category,
  );

  const [showModal, hideModal] = useModal(({ in: open, onExited }) => (
    <ConfirmationModal
      open={open}
      onExited={onExited}
      onClose={hideModal}
      yesButtonProps={{ onClick: hideModal }}
      noButtonProps={{
        onClick: () => {
          hideModal();
          dispatch(resetBookingCreationAction());
        },
      }}
      title="Draft Booking Found"
      content="You have a previously unsubmitted booking. Do you want to continue?"
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
        <HorizontalLayoutContainer>
          <div>
            <h2>{headerContent}</h2>
          </div>
          <BookingCreationHelpButton />
        </HorizontalLayoutContainer>
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
