import { Grid } from "semantic-ui-react";

import { BookingData } from "../../types/bookings";
import { FieldType } from "../../types/venues";
import LinkifyTextViewer from "../linkify-text-viewer";
import PlaceholderWrapper from "../placeholder-wrapper";

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

        <PlaceholderWrapper loading={!formResponseData} size="medium">
          {formResponseData?.flatMap(({ label, response, type }, index) => {
            let displayedResponse: string;
            if (type !== FieldType.Boolean) {
              displayedResponse = response as string;
            } else {
              displayedResponse = response ? "Yes" : "No";
            }

            return displayedResponse
              ? [
                  <Grid.Row key={`${index}-${label}`}>
                    <Grid.Column className="text-viewer" width="4">
                      <strong>{label}:</strong>
                    </Grid.Column>
                    <Grid.Column className="text-viewer" width="12">
                      {displayedResponse}
                    </Grid.Column>
                  </Grid.Row>,
                ]
              : [];
          })}
        </PlaceholderWrapper>
      </Grid>
    </LinkifyTextViewer>
  );
}

export default BookingDetailsView;
