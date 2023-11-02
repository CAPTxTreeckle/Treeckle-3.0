import React, { useMemo, useState } from "react";
import { toast } from "react-toastify";
import { Button, Header, Input, Label, Modal } from "semantic-ui-react";
import useBookingCreationCalendarState from "../../custom-hooks/use-booking-creation-calendar-state";
import { getRepeatedDateRanges } from "../../utils/calendar-utils";
import {
  displayDateTime,
  displayDateTimeRange,
} from "../../utils/transform-utils";
import styles from "./calendar-booking-repeat-modal.module.scss";
import { CalendarBooking } from "../booking-calendar";

const MAX_REPEAT_TIMES = 10;

type Props = {
  event: CalendarBooking | null;
  setEvent: React.Dispatch<React.SetStateAction<CalendarBooking | null>>;
} & Pick<ReturnType<typeof useBookingCreationCalendarState>, "onRepeatSlot">;

function CalendarBookingRepeatModal({ event, setEvent, onRepeatSlot }: Props) {
  const [occurrences, setOccurrences] = useState("1");

  const repeatedTimeslots = useMemo(() => {
    if (!event) return [];
    return getRepeatedDateRanges(event.start, event.end, Number(occurrences));
  }, [event, occurrences]);

  return (
    <Modal open={event != null}>
      <Modal.Header>Repeat Event</Modal.Header>
      <Modal.Content>
        <Modal.Description>
          <Header>Event Details</Header>
          <Label style={{ marginBottom: "1rem" }}>
            {event
              ? displayDateTimeRange(event.start, event.end)
              : "Event not found"}
          </Label>
          <br />
          <Input
            labelPosition="right"
            type="tel"
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              const { value } = e.target;
              const re = /^[0-9\b]+$/;
              if (
                value === "" ||
                (re.test(value) && Number(value) <= MAX_REPEAT_TIMES)
              ) {
                setOccurrences(value);
              }
            }}
            value={occurrences}
          >
            <Label basic>Repeat weekly</Label>
            <input style={{ width: "4rem" }} />
            <Label basic>times</Label>
          </Input>
          <Header>Preview Repeated Dates</Header>
          {/* TODO fix styling instead of inline styles */}
          <div className={styles["booking-preview-grid"]}>
            {repeatedTimeslots.map((range, index) => (
              <Label key={index}>{displayDateTime(range.start)}</Label>
            ))}
          </div>
          <br />
        </Modal.Description>
      </Modal.Content>
      <Modal.Actions>
        <Button color="black" onClick={() => setEvent(null)}>
          Cancel
        </Button>
        <Button
          content="Confirm"
          onClick={() => {
            if (!event) return;
            onRepeatSlot(event.start, event.end, Number(occurrences));
            toast.success(
              `Successfully added ${occurrences} more event${
                occurrences === "1" ? "" : "s"
              }`,
            );
            setEvent(null);
          }}
          positive
        />
      </Modal.Actions>
    </Modal>
  );
}

export default CalendarBookingRepeatModal;
