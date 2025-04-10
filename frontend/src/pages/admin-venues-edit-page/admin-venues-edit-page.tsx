import { useEffect } from "react";
import { Link, useHistory, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { Button, Icon } from "semantic-ui-react";

import PlaceholderWrapper from "../../components/placeholder-wrapper";
import VenueDetailsForm from "../../components/venue-details-form";
import {
  useGetSingleVenue,
  useUpdateVenue,
} from "../../custom-hooks/api/venues-api";
import useScrollToTop from "../../custom-hooks/use-scroll-to-top";
import { ADMIN_VENUES_PATH } from "../../routes/paths";
import { VenueFormProps } from "../../types/venues";
import { ApiResponseError, resolveApiError } from "../../utils/error-utils";

function AdminVenuesEditPage() {
  const history = useHistory();
  const { venueId } = useParams<{ venueId: string }>();
  const { venue, loading, getSingleVenue } = useGetSingleVenue();
  const { updateVenue } = useUpdateVenue();

  useScrollToTop();

  useEffect(() => {
    getSingleVenue(venueId).catch((error) => console.error(error));
  }, [getSingleVenue, venueId]);

  const onSaveChanges = async (data: VenueFormProps) => {
    try {
      await updateVenue(venue?.id ?? venueId, data);
      toast.success("The venue has been updated successfully.");
      history.push(ADMIN_VENUES_PATH);
    } catch (error) {
      resolveApiError(error as ApiResponseError);
    }
  };

  return (
    <>
      <Button
        animated="vertical"
        fluid
        color="red"
        as={Link}
        to={ADMIN_VENUES_PATH}
      >
        <Button.Content hidden content="Cancel Changes" />
        <Button.Content visible content={<Icon name="times" fitted />} />
      </Button>

      <PlaceholderWrapper
        loading={loading}
        loadingMessage="Retrieving venue"
        showDefaultMessage={!venue}
        defaultMessage="No venue found"
        inverted
        placeholder
      >
        <h1>Venue Update</h1>

        <VenueDetailsForm
          onSubmit={onSaveChanges}
          submitButtonProps={{ content: "Save Changes", color: "blue" }}
          defaultValues={venue?.venueFormProps}
        />
      </PlaceholderWrapper>
    </>
  );
}

export default AdminVenuesEditPage;
