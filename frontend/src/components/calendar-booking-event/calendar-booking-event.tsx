import React, { useState } from "react";
import { Button, Icon, Popup } from "semantic-ui-react";
import useBookingCreationCalendarState from "../../custom-hooks/use-booking-creation-calendar-state";

import { displayDateTimeRange } from "../../utils/transform-utils";
import { CalendarBooking } from "../booking-calendar";
import CalendarBookingRepeatModal from "../calendar-booking-repeat-modal/calendar-booking-repeat-modal";
import UserNameRenderer from "../user-name-renderer";
import styles from "./calendar-booking-event.module.scss";

type Props = {
  title: string;
  event: CalendarBooking;
  onRemoveEvent?: (event: CalendarBooking) => void;
} & Partial<
  Pick<ReturnType<typeof useBookingCreationCalendarState>, "onRepeatSlot">
>;

function CalendarBookingEvent({
  title,
  event,
  onRepeatSlot,
  onRemoveEvent,
}: Props) {
  const [modalEvent, setModalEvent] = useState<CalendarBooking | null>(null);

  return (
    <>
      {onRemoveEvent && !event.status && (
        <Icon
          name="close"
          link
          className={styles.removeIcon}
          aria-label="Remove time slot"
          onClick={(e: React.MouseEvent) => {
            e.stopPropagation();
            onRemoveEvent(event);
          }}
        />
      )}
      <Popup
        onClick={(e: React.MouseEvent<HTMLDivElement, MouseEvent>) =>
          e.stopPropagation()
        }
        trigger={<div className={styles.titleContainer}>{title}</div>}
        header={title}
        content={
          <Popup.Content>
            {event.booker && (
              <div>
                <UserNameRenderer
                  cellData={event.booker}
                  rowData={event.booker}
                />
              </div>
            )}
            {event.venueName && <div>{event.venueName}</div>}
            <div>{displayDateTimeRange(event.start, event.end)}</div>
            {onRepeatSlot && (
              <Button
                className={styles.repeatButton}
                content="Repeat"
                onClick={() => setModalEvent(event)}
              />
            )}
          </Popup.Content>
        }
        openOnTriggerMouseEnter
        hoverable
        hideOnScroll
      />
      {onRepeatSlot && (
        <CalendarBookingRepeatModal
          event={modalEvent}
          setEvent={setModalEvent}
          onRepeatSlot={onRepeatSlot}
        />
      )}
    </>
  );
}

export default CalendarBookingEvent;
