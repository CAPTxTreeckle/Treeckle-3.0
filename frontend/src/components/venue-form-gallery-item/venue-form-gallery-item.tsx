import { useHistory } from "react-router-dom";
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
  const history = useHistory();

  const { deleteVenue, isLoading } = useDeleteVenue();

  const onDelete = async () => {
    try {
      await deleteVenue(id);
      getVenues();
      toast.success("The venue has been deleted successfully.");
    } catch (error) {
      resolveApiError(error);
    }
  };

  const onEdit = () => {
    history.push(ADMIN_VENUES_EDIT_PATH.replace(`:${VENUE_ID}`, `${id}`));
  };

  const actionButtons = [
    <Button key="edit" content="Edit" onClick={onEdit} color="black" />,
    <Button
      key="delete"
      content="Delete"
      onClick={onDelete}
      color="red"
      loading={isLoading}
    />,
  ];

  return (
    <div className="flex-display hover-bob">
      <div className="flex-display scale-in-center">
        <PopUpActionsWrapper
          actionButtons={actionButtons}
          offsetRatio={{ heightRatio: -2 }}
        >
          <div className="flex-display pointer">
            <VenueBookingForm venueFormProps={venueFormProps} readOnly />
          </div>
        </PopUpActionsWrapper>
      </div>
    </div>
  );
}

export default VenueFormGalleryItem;
