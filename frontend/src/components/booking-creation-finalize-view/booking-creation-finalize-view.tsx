import { useHistory } from "react-router-dom";
import { toast } from "react-toastify";
import { Segment, Button, Grid } from "semantic-ui-react";
import { useCreateBookings } from "../../custom-hooks/api/bookings-api";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import {
  backFromBookingFinalizationAction,
  resetBookingCreationAction,
  selectBookingFormProps,
  selectCreatedBookings,
  selectNewBookingPeriods,
  selectSelectedVenue,
  successBookingFormSubmissionAction,
} from "../../redux/slices/booking-creation-slice";
import { BOOKINGS_PATH } from "../../routes/paths";
import { FieldType } from "../../types/venues";
import { resolveApiError } from "../../utils/error-utils";
import { displayDateTimeRange } from "../../utils/parser-utils";
import BookingCreationErrorAlert from "../booking-creation-error-alert";
import HorizontalLayoutContainer from "../horizontal-layout-container";
import LinkifyTextViewer from "../linkify-text-viewer";
import PlaceholderWrapper from "../placeholder-wrapper";

function BookingCreationFinalizeView() {
  const selectedVenue = useAppSelector(selectSelectedVenue);
  const newBookingPeriods = useAppSelector(selectNewBookingPeriods);
  const bookingFormProps = useAppSelector(selectBookingFormProps);
  const createdBookings = useAppSelector(selectCreatedBookings);
  const { createBookings, loading } = useCreateBookings();
  const history = useHistory();
  const dispatch = useAppDispatch();

  const { venueFormProps } = selectedVenue ?? {};
  const { title, bookingFormResponses } = bookingFormProps ?? {};
  const isValid =
    selectedVenue && newBookingPeriods && newBookingPeriods.length > 0 && title;

  const onSubmit = async () => {
    if (
      selectedVenue?.id === undefined ||
      !newBookingPeriods ||
      !title ||
      loading
    ) {
      return;
    }

    try {
      const createdBookings = await createBookings({
        title,
        venueId: selectedVenue.id,
        dateTimeRanges: newBookingPeriods,
        formResponseData: bookingFormResponses ?? [],
      });

      toast.success("New booking(s) created successfully.");
      dispatch(successBookingFormSubmissionAction(createdBookings));
    } catch (error) {
      resolveApiError(error);
    }
  };

  return (
    <>
      <Segment padded="very">
        <PlaceholderWrapper
          placeholder
          showDefaultMessage={!isValid}
          defaultMessage={() => <BookingCreationErrorAlert />}
        >
          <LinkifyTextViewer>
            <Grid stackable>
              <Grid.Row>
                <Grid.Column width="4">
                  <strong>Venue:</strong>
                </Grid.Column>
                <Grid.Column width="12">{venueFormProps?.name}</Grid.Column>
              </Grid.Row>

              {newBookingPeriods && newBookingPeriods.length > 0 && (
                <>
                  <Grid.Row>
                    <Grid.Column width="4">
                      <strong>Booking period(s):</strong>
                    </Grid.Column>
                    <Grid.Column width="12">
                      {`1. ${displayDateTimeRange(
                        newBookingPeriods[0].startDateTime,
                        newBookingPeriods[0].endDateTime,
                      )}`}
                    </Grid.Column>
                  </Grid.Row>

                  {newBookingPeriods.flatMap(
                    ({ startDateTime, endDateTime }, index) => {
                      const label = `${index + 1}. ${displayDateTimeRange(
                        startDateTime,
                        endDateTime,
                      )}`;

                      return index > 0
                        ? [
                            <Grid.Row key={label}>
                              <Grid.Column width="4" />
                              <Grid.Column width="12">{label}</Grid.Column>
                            </Grid.Row>,
                          ]
                        : [];
                    },
                  )}
                </>
              )}

              <Grid.Row>
                <Grid.Column width="4">
                  <strong>Booking Title:</strong>
                </Grid.Column>
                <Grid.Column width="12">{title}</Grid.Column>
              </Grid.Row>

              {bookingFormResponses?.flatMap(
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
        </PlaceholderWrapper>
      </Segment>

      <Segment secondary>
        {createdBookings ? (
          <HorizontalLayoutContainer justify="end">
            <Button
              color="black"
              content="Make another booking"
              onClick={() => dispatch(resetBookingCreationAction())}
            />

            <Button
              color="blue"
              content="Done"
              onClick={() => {
                history.push(BOOKINGS_PATH);
                dispatch(resetBookingCreationAction());
              }}
            />
          </HorizontalLayoutContainer>
        ) : (
          <HorizontalLayoutContainer justify="space between">
            <Button
              color="black"
              content="Back"
              onClick={() => dispatch(backFromBookingFinalizationAction())}
              disabled={loading}
            />

            <Button
              color="blue"
              content="Submit"
              loading={loading}
              disabled={!isValid || loading}
              onClick={onSubmit}
            />
          </HorizontalLayoutContainer>
        )}
      </Segment>
    </>
  );
}

export default BookingCreationFinalizeView;
