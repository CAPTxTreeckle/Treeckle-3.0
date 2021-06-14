import { useEffect, useMemo } from "react";
import BaseTable, { Column, AutoResizer } from "react-base-table";
import "react-base-table/styles.css";
import { Button, Label, Popup, Segment } from "semantic-ui-react";
import {
  NAME,
  START_DATE_TIME_STRING,
  END_DATE_TIME_STRING,
  CREATED_AT_STRING,
  VENUE_NAME,
  START_DATE_TIME,
  END_DATE_TIME,
  CREATED_AT,
  STATUS,
  EMAIL,
  BOOKER,
} from "../../constants";
import useTableState, {
  TableStateOptions,
} from "../../custom-hooks/use-table-state";
import { useGetBookings } from "../../custom-hooks/api/bookings-api";
import { BookingStatusDetails, BookingViewProps } from "../../types/bookings";
import { displayDateTime } from "../../utils/parser-utils";
import PlaceholderWrapper from "../placeholder-wrapper";
import SearchBar from "../search-bar";
import HorizontalLayoutContainer from "../horizontal-layout-container";

import styles from "./booking-admin-table.module.scss";

const BOOKER_NAME = `${BOOKER}.${NAME}`;
const BOOKER_EMAIL = `${BOOKER}.${EMAIL}`;

const bookingAdminTableStateOptions: TableStateOptions = {
  searchKeys: [
    BOOKER_NAME,
    BOOKER_EMAIL,
    VENUE_NAME,
    START_DATE_TIME_STRING,
    END_DATE_TIME_STRING,
    CREATED_AT_STRING,
    STATUS,
  ],
};

type BookingAdminDisplayProps = BookingViewProps & {
  [START_DATE_TIME_STRING]: string;
  [END_DATE_TIME_STRING]: string;
  [CREATED_AT_STRING]: string;
};

function BookingAdminTable() {
  const { bookings, getBookings, loading } = useGetBookings();

  useEffect(() => {
    getBookings();
  }, [getBookings]);

  const bookingAdminDisplayData: BookingAdminDisplayProps[] = useMemo(
    () =>
      bookings.map((booking) => ({
        ...booking,
        [NAME]: booking.booker.name,
        [START_DATE_TIME_STRING]: displayDateTime(booking.startDateTime),
        [END_DATE_TIME_STRING]: displayDateTime(booking.endDateTime),
        [CREATED_AT_STRING]: displayDateTime(booking.createdAt),
      })),
    [bookings],
  );

  const {
    processedData: processedBookings,
    sortBy,
    setSortBy,
    onSearchValueChange,
  } = useTableState(bookingAdminDisplayData, bookingAdminTableStateOptions);

  return (
    <Segment.Group raised>
      <Segment secondary>
        <HorizontalLayoutContainer>
          <SearchBar fluid onSearchValueChange={onSearchValueChange} />
          <Popup
            content="Refresh"
            trigger={
              <Button
                icon="redo alternate"
                color="blue"
                onClick={() => getBookings()}
              />
            }
            position="top center"
          />
        </HorizontalLayoutContainer>
      </Segment>

      <Segment className={styles.bookingAdminTable}>
        <AutoResizer>
          {({ width, height }) => (
            <BaseTable<BookingAdminDisplayProps>
              data={processedBookings}
              width={width}
              height={height}
              fixed
              emptyRenderer={() => (
                <PlaceholderWrapper
                  showDefaultMessage={!loading}
                  defaultMessage="No booking request found"
                  placeholder
                />
              )}
              overlayRenderer={() => (
                <PlaceholderWrapper
                  dimmed
                  placeholder
                  loading={loading}
                  fillParent
                  loadingMessage="Retrieving booking requests"
                />
              )}
              onColumnSort={({ key, order }) =>
                setSortBy((sortBy) =>
                  sortBy?.key === key && sortBy?.order === "desc"
                    ? undefined
                    : {
                        key,
                        order,
                      },
                )
              }
              sortBy={sortBy}
            >
              <Column<BookingAdminDisplayProps>
                key={BOOKER_NAME}
                dataKey={BOOKER_NAME}
                title="Name"
                width={150}
                resizable
                sortable
              />
              <Column<BookingAdminDisplayProps>
                key={BOOKER_EMAIL}
                dataKey={BOOKER_EMAIL}
                title="Email"
                width={150}
                resizable
                sortable
              />
              <Column<BookingAdminDisplayProps>
                key={VENUE_NAME}
                dataKey={VENUE_NAME}
                title="Venue"
                width={150}
                resizable
                sortable
              />
              <Column<BookingAdminDisplayProps>
                key={START_DATE_TIME}
                dataKey={START_DATE_TIME_STRING}
                title="Start"
                width={150}
                resizable
                sortable
              />
              <Column<BookingAdminDisplayProps>
                key={END_DATE_TIME}
                dataKey={END_DATE_TIME_STRING}
                title="End"
                width={150}
                resizable
                sortable
              />
              <Column<BookingAdminDisplayProps>
                key={CREATED_AT}
                dataKey={CREATED_AT_STRING}
                title="Created at"
                width={150}
                resizable
                sortable
              />
              <Column<BookingAdminDisplayProps>
                key={STATUS}
                dataKey={STATUS}
                title="Status"
                width={100}
                cellRenderer={({ rowData: { status } }) => (
                  <Label
                    color={BookingStatusDetails.get(status)?.color}
                    className={styles.statusLabel}
                    content={status.toLowerCase()}
                  />
                )}
                sortable
                align="center"
              />
            </BaseTable>
          )}
        </AutoResizer>
      </Segment>
    </Segment.Group>
  );
}

export default BookingAdminTable;
