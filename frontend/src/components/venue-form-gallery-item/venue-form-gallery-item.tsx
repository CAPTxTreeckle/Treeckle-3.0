import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { Button } from "semantic-ui-react";
import { VENUE_ID } from "../../constants";
import { useDeleteVenue } from "../../custom-hooks/api/venues-api";
import { ADMIN_VENUES_EDIT_PATH } from "../../routes/paths";
import { VenueViewProps } from "../../types/venues";
import { resolveApiError } from "../../utils/error-utils";
import PopUpActionsWrapper from "../pop-up-actions-wrapper";
import VenueBookingForm from "../venue-booking-form";

type Props = VenueViewProps & {
  getVenues: () => Promise<unknown>;
};

function VenueFormGalleryItem({ id, venueFormProps, getVenues }: Props) {
  const { deleteVenue, loading } = useDeleteVenue();

  const onDelete = async () => {
    try {
      await deleteVenue(id);
      getVenues();
      toast.success("The venue has been deleted successfully.");
    } catch (error) {
      resolveApiError(error);
    }
  };

  const actionButtons = [
    <Button
      key="edit"
      content="Edit"
      as={Link}
      to={ADMIN_VENUES_EDIT_PATH.replace(`:${VENUE_ID}`, `${id}`)}
      color="black"
    />,
    <Button
      key="delete"
      content="Delete"
      onClick={onDelete}
      color="red"
      loading={loading}
    />,
  ];

  return (
    <div className="flex-display hover-bob pointer">
      <div className="flex-display full-width scale-in-center">
        <PopUpActionsWrapper
          actionButtons={actionButtons}
          offsetRatio={{ heightRatio: -2 }}
        >
          <div className="flex-display full-width">
            <VenueBookingForm venueFormProps={venueFormProps} readOnly />
          </div>
        </PopUpActionsWrapper>
      </div>
    </div>
  );
}

export default VenueFormGalleryItem;
