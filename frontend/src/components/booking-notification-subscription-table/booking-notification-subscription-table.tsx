import { useCallback, useEffect, useMemo } from "react";
import { AutoResizer, Column } from "react-base-table";
import { toast } from "react-toastify";
import { Button, Icon, Popup, Segment } from "semantic-ui-react";

import {
  ACTION,
  CREATED_AT,
  CREATED_AT_STRING,
  EMAIL,
  ID,
  NAME,
  VENUE,
} from "../../constants";
import {
  useDeleteBookingNotificationSubscription,
  useGetBookingNotificationSubscriptions,
} from "../../custom-hooks/api/venues-api";
import useTableState, {
  TableStateOptions,
} from "../../custom-hooks/use-table-state";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import {
  deleteBookingNotificationSubscriptionAction,
  selectBookingNotificationSubscriptions,
  setBookingNotificationSubscriptionsAction,
} from "../../redux/slices/booking-notification-subscription-slice";
import { BookingNotificationSubscriptionData } from "../../types/venues";
import { ApiResponseError, resolveApiError } from "../../utils/error-utils";
import { displayDateTime } from "../../utils/transform-utils";
import { ConfirmationModalPropsGetter } from "../confirmation-modal";
import ConfirmationModalButton from "../confirmation-modal-button";
import HorizontalLayoutContainer from "../horizontal-layout-container";
import PlaceholderWrapper from "../placeholder-wrapper";
import SearchBar from "../search-bar";
import Table from "../table";
import UserEmailRenderer from "../user-email-renderer";
import styles from "./booking-notification-subscription-table.module.scss";

type BookingNotificationSubscriptionViewProps =
  BookingNotificationSubscriptionData & {
    [CREATED_AT_STRING]: string;
  };

const VENUE_NAME = `${VENUE}.${NAME}`;

const BOOKING_NOTIFICATION_SUBSCRIPTION_TABLE_STATE_OPTIONS: TableStateOptions =
  {
    searchKeys: [ID, NAME, EMAIL, CREATED_AT_STRING, VENUE_NAME],
  };

const ActionButton = ({
  id,
  email,
}: BookingNotificationSubscriptionViewProps) => {
  const { deleteBookingNotificationSubscription, loading } =
    useDeleteBookingNotificationSubscription();
  const dispatch = useAppDispatch();

  const getDeleteBookingNotificationSubscriptionModalProps: ConfirmationModalPropsGetter =
    useCallback(
      ({ hideModal }) => ({
        title: "Delete Booking Notification Subscription",
        content: `Are you sure you want to delete the booking notification subscription (${email})?`,
        yesButtonProps: {
          disabled: loading,
          loading,
          onClick: async () => {
            if (loading) {
              return;
            }

            try {
              const { id: deletedBookingNotificationSubscriptionId } =
                await deleteBookingNotificationSubscription(id);

              toast.success(
                "The booking notification subscription has been deleted successfully.",
              );

              dispatch(
                deleteBookingNotificationSubscriptionAction(
                  deletedBookingNotificationSubscriptionId,
                ),
              );
              hideModal();
            } catch (error) {
              resolveApiError(error as ApiResponseError);
            }
          },
        },
        icon: <Icon name="trash alternate outline" />,
      }),
      [email, loading, id, deleteBookingNotificationSubscription, dispatch],
    );

  return (
    <ConfirmationModalButton
      compact
      getConfirmationModalProps={
        getDeleteBookingNotificationSubscriptionModalProps
      }
      icon="trash alternate"
      color="red"
      loading={loading}
      disabled={loading}
    />
  );
};

function BookingNotificationSubscriptionTable() {
  const {
    getBookingNotificationSubscriptions: _getBookingNotificationSubscriptions,
    loading,
  } = useGetBookingNotificationSubscriptions();
  const bookingNotificationSubscriptions = useAppSelector(
    selectBookingNotificationSubscriptions,
  );
  const dispatch = useAppDispatch();

  const bookingNotificationSubscriptionViewData: BookingNotificationSubscriptionViewProps[] =
    useMemo(
      () =>
        bookingNotificationSubscriptions.map((subscription) => ({
          ...subscription,
          [CREATED_AT_STRING]: displayDateTime(subscription.createdAt),
        })),
      [bookingNotificationSubscriptions],
    );

  const getBookingNotificationSubscriptions = useCallback(async () => {
    const bookingNotificationSubscriptions =
      await _getBookingNotificationSubscriptions();
    dispatch(
      setBookingNotificationSubscriptionsAction(
        bookingNotificationSubscriptions,
      ),
    );
  }, [_getBookingNotificationSubscriptions, dispatch]);

  useEffect(() => {
    getBookingNotificationSubscriptions().catch((error) =>
      console.error(error),
    );
  }, [getBookingNotificationSubscriptions]);

  const { processedData, sortBy, setSortBy, onSearchValueChange } =
    useTableState(
      bookingNotificationSubscriptionViewData,
      BOOKING_NOTIFICATION_SUBSCRIPTION_TABLE_STATE_OPTIONS,
    );

  return (
    <>
      <Segment secondary>
        <HorizontalLayoutContainer>
          <SearchBar fluid onSearchValueChange={onSearchValueChange} />
          <Popup
            content="Refresh"
            trigger={
              <Button
                icon="redo alternate"
                color="blue"
                onClick={() => {
                  getBookingNotificationSubscriptions().catch((error) =>
                    console.error(error),
                  );
                }}
                loading={loading}
                disabled={loading}
              />
            }
            position="top center"
            hideOnScroll
          />
        </HorizontalLayoutContainer>
      </Segment>

      <Segment className={styles.bookingNotificationSubscriptionTable}>
        <AutoResizer>
          {({ width, height }) => (
            <Table<BookingNotificationSubscriptionViewProps>
              width={width}
              height={height}
              fixed
              estimatedRowHeight={50}
              data={processedData}
              sortBy={sortBy}
              setSortBy={setSortBy}
              emptyRenderer={() => (
                <PlaceholderWrapper
                  showDefaultMessage={!loading}
                  defaultMessage="No booking notification subscriptions found"
                  placeholder
                />
              )}
              overlayRenderer={
                <PlaceholderWrapper
                  dimmed
                  placeholder
                  loading={loading}
                  fillParent
                  loadingMessage="Retrieving booking notification subscriptions"
                />
              }
            >
              <Column<BookingNotificationSubscriptionViewProps>
                key={ID}
                dataKey={ID}
                title="ID"
                width={80}
                resizable
                sortable
                align="center"
              />
              <Column<BookingNotificationSubscriptionViewProps>
                key={NAME}
                dataKey={NAME}
                title="Name"
                width={250}
                resizable
                sortable
              />
              <Column<BookingNotificationSubscriptionViewProps>
                key={EMAIL}
                title="Email"
                width={280}
                resizable
                sortable
                cellRenderer={UserEmailRenderer}
              />
              <Column<BookingNotificationSubscriptionViewProps>
                key={VENUE_NAME}
                dataKey={VENUE_NAME}
                title="Venue"
                width={250}
                resizable
                sortable
              />
              <Column<BookingNotificationSubscriptionViewProps>
                key={CREATED_AT}
                dataKey={CREATED_AT_STRING}
                title="Created at"
                width={250}
                resizable
                sortable
              />
              <Column<BookingNotificationSubscriptionViewProps>
                key={ACTION}
                title="Action"
                align="center"
                resizable
                width={150}
                cellRenderer={({ rowData }) => <ActionButton {...rowData} />}
              />
            </Table>
          )}
        </AutoResizer>
      </Segment>
    </>
  );
}

export default BookingNotificationSubscriptionTable;
