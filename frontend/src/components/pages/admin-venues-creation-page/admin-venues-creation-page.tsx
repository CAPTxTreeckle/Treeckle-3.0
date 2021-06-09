import { Link, useHistory } from "react-router-dom";
import { toast } from "react-toastify";
import { Button } from "semantic-ui-react";
import { useCreateVenue } from "../../../custom-hooks/api/venues-api";
import { ADMIN_VENUES_PATH } from "../../../routes/paths";
import { VenueFormProps } from "../../../types/venues";
import { resolveApiError } from "../../../utils/error-utils";
import VenueDetailsForm from "../../venue-details-form";

function AdminVenuesCreationPage() {
  const history = useHistory();
  const { createVenue } = useCreateVenue();

  const onCreateVenue = async (venueFormProps: VenueFormProps) => {
    try {
      await createVenue(venueFormProps);
      toast.success("The new venue has been created successfully.");
      history.push(ADMIN_VENUES_PATH);
    } catch (error) {
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
        <Button.Content visible content={<i className="fas fa-times" />} />
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
