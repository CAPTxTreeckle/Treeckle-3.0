import { useEffect, useMemo } from "react";
import { useGetVenues } from "../../custom-hooks/api/venues-api";
import { sort } from "../../utils/parser-utils";
import Tab, { TabOption } from "../tab";
import BookingVenueCalendar from "../booking-venue-calendar";
import PlaceholderWrapper from "../placeholder-wrapper";

function BookingAdminCalendarsSection() {
  const { venues, loading, getVenues } = useGetVenues();

  const sortedVenueOptions: TabOption[] = useMemo(
    () =>
      sort(
        venues.map((venue) => ({
          name: venue.venueFormProps.name,
          pane: <BookingVenueCalendar {...venue} />,
        })),
        { props: "name" },
      ),
    [venues],
  );

  useEffect(() => {
    getVenues({ fullDetails: false });
  }, [getVenues]);

  return (
    <PlaceholderWrapper
      loading={loading}
      loadingMessage="Retrieving venue calendars"
      showDefaultMessage={venues.length === 0}
      defaultMessage="No venue calendars found"
      inverted
      placeholder
    >
      <Tab options={sortedVenueOptions} showTitle={false} dropdownOnly />
    </PlaceholderWrapper>
  );
}

export default BookingAdminCalendarsSection;
