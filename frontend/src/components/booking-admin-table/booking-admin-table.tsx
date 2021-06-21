import { useEffect, useMemo, useRef } from "react";
import clsx from "clsx";
import BaseTable, {
  Column,
  AutoResizer,
  TableComponents,
} from "react-base-table";
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
  ID,
  USER_ID,
} from "../../constants";
import { PROFILE_PATH } from "../../routes/paths";
import useTableState, {
  TableStateOptions,
} from "../../custom-hooks/use-table-state";
import { useGetBookings } from "../../custom-hooks/api/bookings-api";
import { BookingStatusDetails, BookingViewProps } from "../../types/bookings";
import { displayDateTime } from "../../utils/parser-utils";
import PlaceholderWrapper from "../placeholder-wrapper";
import SearchBar from "../search-bar";
import HorizontalLayoutContainer from "../horizontal-layout-container";
import LinkifyTextViewer from "../linkify-text-viewer";
import BookingDetailsView from "../booking-details-view";

import styles from "./booking-admin-table.module.scss";
import "react-base-table/styles.css";

const BOOKER_NAME = `${BOOKER}.${NAME}`;
const BOOKER_EMAIL = `${BOOKER}.${EMAIL}`;

const bookingAdminTableStateOptions: TableStateOptions = {
  searchKeys: [
    ID,
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
  booking?: BookingViewProps;
  children: [{ [ID]: string; booking: BookingViewProps }];
};

const tableComponents: TableComponents<BookingAdminDisplayProps> = {
  TableCell: ({
    // eslint-disable-next-line react/prop-types
    className,
    // eslint-disable-next-line react/prop-types
    column: { key },
    // eslint-disable-next-line react/prop-types
    cellData,
    // eslint-disable-next-line react/prop-types
    rowData: {
      // eslint-disable-next-line react/prop-types
      booker: { id: bookerId },
    },
  }) => {
    switch (key) {
      case ID:
        return <div className={clsx(className, "pointer")}>{cellData}</div>;
      case BOOKER_NAME:
        return (
          <div className={className}>
            <a
              href={PROFILE_PATH.replace(`:${USER_ID}`, `${bookerId}`)}
              target="_blank"
              rel="noopener noreferrer"
            >
              {cellData}
            </a>
          </div>
        );
      case BOOKER_EMAIL:
        return (
          <LinkifyTextViewer>
            <div className={className}>{cellData}</div>
          </LinkifyTextViewer>
        );
      case STATUS:
        return (
          <Label
            color={BookingStatusDetails.get(cellData)?.color}
            className={styles.statusLabel}
            content={<div className={className}>{cellData.toLowerCase()}</div>} // eslint-disable-line react/prop-types
          />
        );
      default:
        return <div className={className}>{cellData}</div>;
    }
  },
  // eslint-disable-next-line react/prop-types
  SortIndicator: ({ sortOrder, className }) => (
    <div className={className}>
      <i
        className={clsx(
          "fas icon",
          sortOrder === "asc" ? "fa-caret-up" : "fa-caret-down",
        )}
      />
    </div>
  ),
};

function BookingAdminTable() {
  const { bookings, getBookings, loading } = useGetBookings();
  const tableRef = useRef<BaseTable<BookingAdminDisplayProps>>(null);
  const table = tableRef.current;

  useEffect(() => {
    getBookings();
  }, [getBookings]);

  const bookingAdminDisplayData: BookingAdminDisplayProps[] = useMemo(
    () =>
      bookings.map((booking) => ({
        ...booking,
        [START_DATE_TIME_STRING]: displayDateTime(booking.startDateTime),
        [END_DATE_TIME_STRING]: displayDateTime(booking.endDateTime),
        [CREATED_AT_STRING]: displayDateTime(booking.createdAt),
        children: [{ [ID]: `${booking.id}-details`, booking }],
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
              ref={tableRef}
              className={styles.innerTable}
              rowClassName={styles.row}
              data={processedBookings}
              width={width}
              height={height}
              estimatedRowHeight={50}
              fixed
              emptyRenderer={() => (
                <PlaceholderWrapper
                  showDefaultMessage={!loading}
                  defaultMessage="No booking request found"
                  placeholder
                />
              )}
              overlayRenderer={
                <PlaceholderWrapper
                  dimmed
                  placeholder
                  loading={loading}
                  fillParent
                  loadingMessage="Retrieving booking requests"
                />
              }
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
              expandColumnKey={ID}
              components={tableComponents}
              rowRenderer={({ rowData: { booking }, cells }) =>
                booking ? (
                  <Segment className={styles.extraContentContainer} basic>
                    <BookingDetailsView
                      className={styles.detailsContainer}
                      booking={booking}
                    />
                  </Segment>
                ) : (
                  cells
                )
              }
              cellProps={({ column: { key }, rowData: { id } }) => {
                if (key !== ID || !table) {
                  return;
                }

                const expandedRowKeys = table.getExpandedRowKeys();
                const newExpandedRowKeys = expandedRowKeys.includes(id)
                  ? expandedRowKeys.filter((key) => key !== id)
                  : expandedRowKeys.concat([id]);

                return {
                  onClick: () => table.setExpandedRowKeys(newExpandedRowKeys),
                };
              }}
            >
              <Column<BookingAdminDisplayProps>
                key={ID}
                dataKey={ID}
                title="ID"
                width={75}
                resizable
                sortable
              />
              <Column<BookingAdminDisplayProps>
                key={BOOKER_NAME}
                dataKey={BOOKER_NAME}
                title="Name"
                width={175}
                resizable
                sortable
              />
              <Column<BookingAdminDisplayProps>
                key={BOOKER_EMAIL}
                dataKey={BOOKER_EMAIL}
                title="Email"
                width={175}
                resizable
                sortable
              />
              <Column<BookingAdminDisplayProps>
                key={VENUE_NAME}
                dataKey={VENUE_NAME}
                title="Venue"
                width={175}
                resizable
                sortable
              />
              <Column<BookingAdminDisplayProps>
                key={START_DATE_TIME}
                dataKey={START_DATE_TIME_STRING}
                title="Start"
                width={175}
                resizable
                sortable
              />
              <Column<BookingAdminDisplayProps>
                key={END_DATE_TIME}
                dataKey={END_DATE_TIME_STRING}
                title="End"
                width={175}
                resizable
                sortable
              />
              <Column<BookingAdminDisplayProps>
                key={CREATED_AT}
                dataKey={CREATED_AT_STRING}
                title="Created at"
                width={175}
                resizable
                sortable
              />
              <Column<BookingAdminDisplayProps>
                key={STATUS}
                dataKey={STATUS}
                title="Status"
                width={100}
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
