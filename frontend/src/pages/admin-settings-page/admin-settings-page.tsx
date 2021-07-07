import { Icon, Message, Segment } from "semantic-ui-react";
import BookingNotificationSubscriptionForm from "../../components/booking-notification-subscription-form";
import BookingNotificationSubscriptionTable from "../../components/booking-notification-subscription-table";

function AdminSettingsPage() {
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
                change in status of the bookings associated with subscribed
                venue.
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
