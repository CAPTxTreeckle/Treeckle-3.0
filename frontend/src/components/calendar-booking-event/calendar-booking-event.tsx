import React from "react";
import { Popup } from "semantic-ui-react";

import { displayDateTimeRange } from "../../utils/transform-utils";
import { CalendarBooking } from "../booking-calendar";
import UserNameRenderer from "../user-name-renderer";
import styles from "./calendar-booking-event.module.scss";

type Props = {
  title: string;
  event: CalendarBooking;
};

function CalendarBookingEvent({
  title,
  event: { booker, start, end, venueName },
}: Props) {
  return (
    <Popup
      onClick={(e: React.MouseEvent<HTMLDivElement, MouseEvent>) =>
        e.stopPropagation()
      }
      trigger={<div className={styles.titleContainer}>{title}</div>}
      on="hover"
      header={title}
      content={
        <Popup.Content>
          {booker && (
            <div>
              <UserNameRenderer cellData={booker} rowData={booker} />
            </div>
          )}

          {venueName && <div>{venueName}</div>}
          <div>{displayDateTimeRange(start, end)}</div>
        </Popup.Content>
      }
      hoverable
      hideOnScroll
    />
  );
}

export default CalendarBookingEvent;
