import { Link, useHistory } from "react-router-dom";
import { toast } from "react-toastify";
import { Button, Icon } from "semantic-ui-react";

import VenueDetailsForm from "../../components/venue-details-form";
import { useCreateVenue } from "../../custom-hooks/api/venues-api";
import useScrollToTop from "../../custom-hooks/use-scroll-to-top";
import { ADMIN_VENUES_PATH } from "../../routes/paths";
import { VenueFormProps } from "../../types/venues";
import { resolveApiError } from "../../utils/error-utils";

function AdminVenuesCreationPage() {
  const history = useHistory();
  const { createVenue } = useCreateVenue();

  useScrollToTop();

  const onCreateVenue = async (venueFormProps: VenueFormProps) => {
    try {
      await createVenue(venueFormProps);
      toast.success("The new venue has been created successfully.");
      history.push(ADMIN_VENUES_PATH);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      resolveApiError(error);
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
        <Button.Content hidden content="Cancel Venue Creation" />
        <Button.Content visible content={<Icon name="times" fitted />} />
      </Button>

      <h1>Venue Creation</h1>

      <VenueDetailsForm
        onSubmit={onCreateVenue}
        submitButtonProps={{ content: "Create Venue", color: "blue" }}
      />
    </>
  );
}

export default AdminVenuesCreationPage;
