import React from "react";
import { Grid } from "semantic-ui-react";
import { BookingData } from "../../types/bookings";
import { FieldType } from "../../types/venues";
import LinkifyTextViewer from "../linkify-text-viewer";

type Props = {
  className?: string;
  booking: BookingData;
};

function BookingDetailsView({
  className,
  booking: { title, formResponseData },
}: Props) {
  return (
    <LinkifyTextViewer>
      <Grid className={className} padded="horizontally">
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
                    <Grid.Column width="4">
                      <strong>{fieldLabel}:</strong>
                    </Grid.Column>
                    <Grid.Column width="12">{displayedResponse}</Grid.Column>
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
