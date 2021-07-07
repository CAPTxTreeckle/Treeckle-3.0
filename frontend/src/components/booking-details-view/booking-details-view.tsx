import clsx from "clsx";
import { Grid } from "semantic-ui-react";
import { BookingData } from "../../types/bookings";
import { FieldType } from "../../types/venues";
import LinkifyTextViewer from "../linkify-text-viewer";
import UserNameRender from "../user-name-renderer";
import UserEmailRenderer from "../user-email-renderer";
import { displayDateTime } from "../../utils/parser-utils";
import styles from "./booking-details-view.module.scss";
import BookingStatusButton from "../booking-status-button";

type Props = {
  className?: string;
  booking: BookingData;
  showFullDetails?: boolean;
  stackable?: boolean;
};

function BookingDetailsView({
  className,
  booking: {
    title,
    formResponseData,
    venue,
    booker,
    status,
    id,
    createdAt,
    startDateTime,
    endDateTime,
  },
  showFullDetails = false,
  stackable = false,
}: Props) {
  return (
    <LinkifyTextViewer>
      <Grid
        className={clsx(styles.bookingDetailsView, className)}
        padded="horizontally"
        stackable={stackable}
      >
        {showFullDetails && (
          <>
            <Grid.Row>
              <Grid.Column width="4">
                <strong>Booking ID:</strong>
              </Grid.Column>
              <Grid.Column width="12">{id}</Grid.Column>
            </Grid.Row>

            <Grid.Row>
              <Grid.Column width="4">
                <strong>Booker name:</strong>
              </Grid.Column>
              <Grid.Column width="12">
                <UserNameRender rowData={booker} />
              </Grid.Column>
            </Grid.Row>

            <Grid.Row>
              <Grid.Column width="4">
                <strong>Booker email:</strong>
              </Grid.Column>
              <Grid.Column width="12">
                <UserEmailRenderer rowData={booker} />
              </Grid.Column>
            </Grid.Row>

            <Grid.Row>
              <Grid.Column width="4">
                <strong>Status:</strong>
              </Grid.Column>
              <Grid.Column width="12">
                <BookingStatusButton bookingId={id} status={status} />
              </Grid.Column>
            </Grid.Row>

            <Grid.Row>
              <Grid.Column width="4">
                <strong>Venue:</strong>
              </Grid.Column>
              <Grid.Column width="12">{venue.name}</Grid.Column>
            </Grid.Row>

            <Grid.Row>
              <Grid.Column width="4">
                <strong>Start</strong>
              </Grid.Column>
              <Grid.Column width="12">
                {displayDateTime(startDateTime)}
              </Grid.Column>
            </Grid.Row>

            <Grid.Row>
              <Grid.Column width="4">
                <strong>End</strong>
              </Grid.Column>
              <Grid.Column width="12">
                {displayDateTime(endDateTime)}
              </Grid.Column>
            </Grid.Row>

            <Grid.Row>
              <Grid.Column width="4">
                <strong>Created at:</strong>
              </Grid.Column>
              <Grid.Column width="12">{displayDateTime(createdAt)}</Grid.Column>
            </Grid.Row>
          </>
        )}

        <Grid.Row>
          <Grid.Column width="4">
            <strong>Booking title:</strong>
          </Grid.Column>
          <Grid.Column width="12">{title}</Grid.Column>
        </Grid.Row>

        {formResponseData.flatMap(
          ({ fieldLabel, response, fieldType }, index) => {
            let displayedResponse: string;
            if (fieldType !== FieldType.Boolean) {
              displayedResponse = response as string;
            } else {
              displayedResponse = response ? "Yes" : "No";
            }

            return displayedResponse
              ? [
                  <Grid.Row key={`${index}-${fieldLabel}`}>
                    <Grid.Column className="text-viewer" width="4">
                      <strong>{fieldLabel}:</strong>
                    </Grid.Column>
                    <Grid.Column className="text-viewer" width="12">
                      {displayedResponse}
                    </Grid.Column>
                  </Grid.Row>,
                ]
              : [];
          },
        )}
      </Grid>
    </LinkifyTextViewer>
  );
}

export default BookingDetailsView;
