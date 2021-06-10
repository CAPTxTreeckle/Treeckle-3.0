import { Link } from "react-router-dom";
import { Button } from "semantic-ui-react";
import VenueFormGallery from "../../venue-form-gallery";
import { ADMIN_VENUES_CREATION_PATH } from "../../../routes/paths";

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
        <Button.Content visible content={<i className="fas fa-plus" />} />
      </Button>

      <h2>All Venues</h2>

      <VenueFormGallery />
    </>
  );
}

export default AdminVenuesPage;
