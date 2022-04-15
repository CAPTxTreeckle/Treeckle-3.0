import { useEffect, useMemo } from "react";
import { Card, Grid, Header, Segment } from "semantic-ui-react";

import { useGetVenueCategories } from "../../custom-hooks/api/venues-api";
import useScrollToTop from "../../custom-hooks/use-scroll-to-top";
import { useAppDispatch } from "../../redux/hooks";
import { chooseVenueCategoryAction } from "../../redux/slices/booking-creation-slice";
import { sort } from "../../utils/transform-utils";
import PlaceholderWrapper from "../placeholder-wrapper";

function BookingCreationCategorySelector() {
  const { venueCategories, getVenueCategories, loading } =
    useGetVenueCategories();
  const dispatch = useAppDispatch();

  useScrollToTop();

  useEffect(() => {
    getVenueCategories();
  }, [getVenueCategories]);

  const sortedVenueCategories = useMemo(
    () => sort(venueCategories),
    [venueCategories],
  );
  return (
    <Segment>
      <PlaceholderWrapper
        loadingMessage="Retrieving categories"
        loading={loading}
        showDefaultMessage={sortedVenueCategories.length === 0}
        defaultMessage="No categories found"
      >
        <Grid columns="3" stackable stretched centered padded>
          {sortedVenueCategories.map((category) => (
            <Grid.Column key={category}>
              <div className="flex-display hover-bob pointer hover-dimming">
                <div className="flex-display full-width scale-in-center">
                  <Card
                    as={Segment}
                    centered
                    raised
                    padded
                    fluid
                    onClick={() =>
                      dispatch(chooseVenueCategoryAction(category))
                    }
                  >
                    <Card.Content>
                      <Header textAlign="center">{category}</Header>
                    </Card.Content>
                  </Card>
                </div>
              </div>
            </Grid.Column>
          ))}
        </Grid>
      </PlaceholderWrapper>
    </Segment>
  );
}

export default BookingCreationCategorySelector;
