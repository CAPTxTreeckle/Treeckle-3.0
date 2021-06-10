import { useEffect, useMemo } from "react";
import classNames from "classnames";
import { Grid } from "semantic-ui-react";
import PlaceholderWrapper from "../placeholder-wrapper";
import { useGetVenues } from "../../custom-hooks/api/venues-api";
import VenueFormGalleryItem from "../venue-form-gallery-item";
import { sort } from "../../utils/parser-utils";
import styles from "./venue-form-gallery.module.scss";

function VenueFormGallery() {
  const { venues, isLoading, getVenues } = useGetVenues();
  const sortedVenues = useMemo(
    () => sort(venues, { props: "venueFormProps.name" }),
    [venues],
  );

  useEffect(() => {
    getVenues();
  }, [getVenues]);

  return (
    <PlaceholderWrapper
      isLoading={isLoading}
      loadingMessage="Retrieving venues"
      showDefaultMessage={venues.length === 0}
      defaultMessage="No venue found"
      placeholder
      inverted
    >
      <Grid
        className={classNames(styles.venueFormGallery, styles.important)}
        stretched
      >
        {sortedVenues.map((venue) => (
          <Grid.Column key={venue.id} width="16">
            <VenueFormGalleryItem {...venue} getVenues={getVenues} />
          </Grid.Column>
        ))}
      </Grid>
    </PlaceholderWrapper>
  );
}

export default VenueFormGallery;
