import { useEffect, useMemo } from "react";
import { Button, Card, Grid, Header, Segment } from "semantic-ui-react";

import { useGetVenues } from "../../custom-hooks/api/venues-api";
import useScrollToTop from "../../custom-hooks/use-scroll-to-top";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import {
  chooseVenueAction,
  resetBookingCreationAction,
  selectSelectedCategory,
} from "../../redux/slices/booking-creation-slice";
import { sort } from "../../utils/transform-utils";
import HorizontalLayoutContainer from "../horizontal-layout-container";
import PlaceholderWrapper from "../placeholder-wrapper";

function BookingCreationVenueSelector() {
  const selectedCategory = useAppSelector(selectSelectedCategory);
  const { venues, loading, getVenues } = useGetVenues();
  const dispatch = useAppDispatch();

  useScrollToTop();

  useEffect(() => {
    getVenues({ category: selectedCategory, fullDetails: true }).catch(
      (error) => console.error(error),
    );
  }, [getVenues, selectedCategory]);

  const sortedVenues = useMemo(
    () => sort(venues, { props: "venueFormProps.name" }),
    [venues],
  );

  return (
    <>
      <Segment>
        <PlaceholderWrapper
          loadingMessage="Retrieving venues"
          loading={loading}
          showDefaultMessage={sortedVenues.length === 0}
          defaultMessage="No venues found"
        >
          <Grid columns="3" stackable stretched centered padded>
            {sortedVenues.map((venue) => (
              <Grid.Column key={venue.id}>
                <div className="flex-display hover-bob pointer hover-dimming">
                  <div className="flex-display full-width scale-in-center">
                    <Card
                      as={Segment}
                      centered
                      raised
                      padded
                      fluid
                      onClick={() => dispatch(chooseVenueAction(venue))}
                    >
                      <Card.Content>
                        <Header textAlign="center">
                          {venue.venueFormProps.name}
                          {venue.venueFormProps.capacity && (
                            <Header.Subheader>
                              Recommended Capacity:{" "}
                              <strong>{venue.venueFormProps.capacity}</strong>
                            </Header.Subheader>
                          )}
                        </Header>
                      </Card.Content>
                    </Card>
                  </div>
                </div>
              </Grid.Column>
            ))}
          </Grid>
        </PlaceholderWrapper>
      </Segment>

      <Segment secondary>
        <HorizontalLayoutContainer>
          <Button
            color="black"
            content="Back"
            onClick={() => dispatch(resetBookingCreationAction())}
          />
        </HorizontalLayoutContainer>
      </Segment>
    </>
  );
}

export default BookingCreationVenueSelector;
