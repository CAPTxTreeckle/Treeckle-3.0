import { Button, Popup, Segment } from "semantic-ui-react";
import HorizontalLayoutContainer from "../horizontal-layout-container";
import SearchBar from "../search-bar";

function BookingNotificationSubscriptionTable() {
  return (
    <>
      <Segment secondary>
        <HorizontalLayoutContainer>
          <SearchBar fluid onSearchValueChange={() => {}} />
          <Popup
            content="Refresh"
            trigger={
              <Button
                icon="redo alternate"
                color="blue"
                // onClick={getBookings}
                // loading={loading}
                // disabled={loading}
              />
            }
            position="top center"
            hideOnScroll
          />
        </HorizontalLayoutContainer>
      </Segment>
    </>
  );
}

export default BookingNotificationSubscriptionTable;
