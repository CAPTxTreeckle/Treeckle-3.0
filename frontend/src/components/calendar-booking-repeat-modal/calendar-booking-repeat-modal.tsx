import { addDays, addMonths } from "date-fns";
import React, { useMemo, useState } from "react";
import {
  Button,
  Header,
  HeaderSubheader,
  Input,
  Label,
  Modal,
} from "semantic-ui-react";

import { CalendarBooking } from "../booking-calendar";

type Props = {
  event: CalendarBooking | null;
  setEvent: React.Dispatch<React.SetStateAction<CalendarBooking | null>>;
};

function CalendarBookingRepeatModal({ event, setEvent }: Props) {
  const [occurrences, setOccurrences] = useState("");

  const repeatedTimeslots = useMemo(() => {
    const output = [];
    if (!event || occurrences.length === 0) return [];

    for (let i = 0; i < Number(occurrences); i += 1) {
      output.push([
        addDays(event.start, 7 * (i + 1)),
        addDays(event.end, 7 * (i + 1)),
      ]);
    }
    return output;
  }, [event, occurrences]);

  return (
    <Modal open={event != null}>
      <Modal.Header>Repeat Event</Modal.Header>
      <Modal.Content>
        <Modal.Description>
          <Header>Event Details</Header>
          <p>{event?.start.toString()}</p>
          <p>{event?.end.toString()}</p>
          <Input
            labelPosition="right"
            type="tel"
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              const { value } = e.target;
              const re = /^[0-9\b]+$/;
              if (value === "" || (value.length <= 2 && re.test(value))) {
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
          <HeaderSubheader>Event will be repeated on:</HeaderSubheader>
          {repeatedTimeslots.map(([start, end]) => (
            <div key={start.toString()}>
              <p>{start.toString()}</p>
              <p>{end.toString()}</p>
            </div>
          ))}
        </Modal.Description>
      </Modal.Content>
      <Modal.Actions>
        <Button color="black" onClick={() => setEvent(null)}>
          Cancel
        </Button>
        <Button content="Confirm" onClick={() => setEvent(null)} positive />
      </Modal.Actions>
    </Modal>
  );
}

export default CalendarBookingRepeatModal;
