import { useEffect, useMemo, useCallback } from "react";
import PlaceholderWrapper from "../placeholder-wrapper";
import { useGetVenues } from "../../custom-hooks/api/venues-api";
import VenueFormGalleryItem from "../venue-form-gallery-item";
import { sort } from "../../utils/parser-utils";
import styles from "./venue-form-gallery.module.scss";

function VenueFormGallery() {
  const { venues, loading, getVenues: _getVenues } = useGetVenues();
  const sortedVenues = useMemo(
    () => sort(venues, { props: "venueFormProps.name" }),
    [venues],
  );

  const getVenues = useCallback(
    () => _getVenues({ fullDetails: true }),
    [_getVenues],
  );

  useEffect(() => {
    getVenues();
  }, [getVenues]);

  return (
    <PlaceholderWrapper
      loading={loading}
      loadingMessage="Retrieving venues"
      showDefaultMessage={venues.length === 0}
      defaultMessage="No venues found"
      placeholder
      inverted
    >
      <div className={styles.venueFormGallery}>
        {sortedVenues.map((venue) => (
          <VenueFormGalleryItem
            key={venue.id}
            {...venue}
            getVenues={getVenues}
          />
        ))}
      </div>
    </PlaceholderWrapper>
  );
}

export default VenueFormGallery;
