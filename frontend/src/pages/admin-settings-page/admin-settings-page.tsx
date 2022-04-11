import { Icon, Message, Segment } from "semantic-ui-react";

import BookingNotificationSubscriptionForm from "../../components/booking-notification-subscription-form";
import BookingNotificationSubscriptionTable from "../../components/booking-notification-subscription-table";
import useScrollToTop from "../../custom-hooks/use-scroll-to-top";

function AdminSettingsPage() {
  useScrollToTop();

  return (
    <>
      <h1>Booking Notification Subscriptions</h1>

      <Segment.Group raised>
        <Segment>
          <Message info icon>
            <Icon name="info circle" />
            <Message.Content>
              <p>
                The emails below will receive notifications for any creation or
                change in status of the bookings associated with the subscribed
                venue.
              </p>
              <p>
                <strong>Note:</strong> The emails can be <strong>any</strong>{" "}
                valid emails. It is not necessary for the emails to be
                associated with any Treeckle accounts.
              </p>
            </Message.Content>
          </Message>

          <BookingNotificationSubscriptionForm />
        </Segment>

        <BookingNotificationSubscriptionTable />
      </Segment.Group>
    </>
  );
}

export default AdminSettingsPage;
