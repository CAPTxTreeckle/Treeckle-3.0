import { Link } from "react-router-dom";
import { Button, Icon } from "semantic-ui-react";

import VenueFormGallery from "../../components/venue-form-gallery";
import { ADMIN_VENUES_CREATION_PATH } from "../../routes/paths";

function AdminVenuesPage() {
  return (
    <>
      <Button
        animated="vertical"
        fluid
        color="teal"
        as={Link}
        to={ADMIN_VENUES_CREATION_PATH}
      >
        <Button.Content hidden content="Create New Venue" />
        <Button.Content visible content={<Icon name="plus" fitted />} />
      </Button>

      <h1>All Venues</h1>

      <VenueFormGallery />
    </>
  );
}

export default AdminVenuesPage;
