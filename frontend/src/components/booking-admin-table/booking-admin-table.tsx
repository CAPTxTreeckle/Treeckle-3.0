import {
  Key,
  ReactNode,
  useEffect,
  useMemo,
  useCallback,
  useState,
} from "react";
import clsx from "clsx";
import BaseTable, {
  Column,
  AutoResizer,
  TableComponents,
  SortOrder,
} from "react-base-table";
import { Button, Icon, Popup, Segment } from "semantic-ui-react";
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
  ACTION,
} from "../../constants";
import { PROFILE_PATH } from "../../routes/paths";
import useTableState, {
  TableStateOptions,
} from "../../custom-hooks/use-table-state";
import { useGetBookings } from "../../custom-hooks/api/bookings-api";
import { BookingViewProps } from "../../types/bookings";
import { displayDateTime } from "../../utils/parser-utils";
import PlaceholderWrapper from "../placeholder-wrapper";
import SearchBar from "../search-bar";
import HorizontalLayoutContainer from "../horizontal-layout-container";
import LinkifyTextViewer from "../linkify-text-viewer";
import BookingDetailsView from "../booking-details-view";
import BookingStatusButton from "../booking-status-button";

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
  // eslint-disable-next-line react/prop-types
  SortIndicator: ({ sortOrder, className }) => (
    <div className={className}>
      <Icon name={sortOrder === "asc" ? "caret up" : "caret down"} />
    </div>
  ),
  // eslint-disable-next-line react/prop-types
  ExpandIcon: ({ expandable, expanded, onExpand }) => {
    if (!expandable) {
      return null;
    }

    return (
      <Icon
        link
        className={clsx(styles.expandIcon, expanded && styles.expanded)}
        name="plus circle"
        onClick={() => {
          onExpand(!expanded);
        }}
        fitted
      />
    );
  },
};

const rowRenderer = ({
  rowData: { booking },
  cells,
}: {
  rowData: BookingAdminDisplayProps;
  cells: ReactNode[];
}) =>
  booking ? (
    <Segment className={styles.extraContentContainer} basic>
      <BookingDetailsView
        className={styles.detailsContainer}
        booking={booking}
      />
    </Segment>
  ) : (
    cells
  );

const nameRenderer = ({
  rowData: { booker },
}: {
  rowData: Partial<BookingAdminDisplayProps>;
}) =>
  booker ? (
    <a
      href={PROFILE_PATH.replace(`:${USER_ID}`, `${booker.id}`)}
      target="_blank"
      rel="noopener noreferrer"
    >
      {booker.name}
    </a>
  ) : null;

const emailRenderer = ({
  rowData: { booker },
}: {
  rowData: Partial<BookingAdminDisplayProps>;
}) => (booker ? <LinkifyTextViewer>{booker.email}</LinkifyTextViewer> : null);

function BookingAdminTable() {
  const { bookings, getBookings } = useGetBookings();
  const [loading, setLoading] = useState(false);

  const onRefresh = useCallback(async () => {
    setLoading(true);
    await getBookings();
    setLoading(false);
  }, [getBookings]);

  useEffect(() => {
    onRefresh();
  }, [onRefresh]);

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

  const onColumnSort = useCallback(
    ({ key, order }: { key: Key; order: SortOrder }) =>
      setSortBy((sortBy) =>
        sortBy?.key === key && sortBy?.order === "desc"
          ? undefined
          : {
              key,
              order,
            },
      ),
    [setSortBy],
  );

  const statusButtonRenderer = useCallback(
    ({
      rowData: { status, id },
    }: {
      // eslint-disable-next-line react/no-unused-prop-types
      rowData: Partial<BookingAdminDisplayProps>;
    }) =>
      status && id !== undefined ? (
        <BookingStatusButton
          bookingId={id}
          status={status}
          getBookings={getBookings}
          adminView
        />
      ) : null,
    [getBookings],
  );

  return (
    <Segment.Group raised>
      <Segment secondary>
        <HorizontalLayoutContainer>
          <SearchBar fluid onSearchValueChange={onSearchValueChange} />
          <Popup
            content="Refresh"
            trigger={
              <Button icon="redo alternate" color="blue" onClick={onRefresh} />
            }
            position="top center"
          />
        </HorizontalLayoutContainer>
      </Segment>

      <Segment className={styles.bookingAdminTable}>
        <AutoResizer>
          {({ width, height }) => (
            <BaseTable<BookingAdminDisplayProps>
              className={styles.innerTable}
              rowClassName={styles.row}
              headerClassName={styles.headerRow}
              data={processedBookings}
              width={width}
              height={height}
              estimatedRowHeight={50}
              fixed
              emptyRenderer={() => (
                <PlaceholderWrapper
                  showDefaultMessage={!loading}
                  defaultMessage="No booking requests found"
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
              onColumnSort={onColumnSort}
              sortBy={sortBy}
              expandColumnKey={ACTION}
              components={tableComponents}
              rowRenderer={rowRenderer}
            >
              <Column<BookingAdminDisplayProps>
                key={ID}
                dataKey={ID}
                title="ID"
                width={60}
                resizable
                sortable
                align="center"
              />
              <Column<BookingAdminDisplayProps>
                key={BOOKER_NAME}
                title="Name"
                width={150}
                resizable
                sortable
                cellRenderer={nameRenderer}
              />
              <Column<BookingAdminDisplayProps>
                key={BOOKER_EMAIL}
                title="Email"
                width={160}
                resizable
                sortable
                cellRenderer={emailRenderer}
              />
              <Column<BookingAdminDisplayProps>
                key={VENUE_NAME}
                dataKey={VENUE_NAME}
                title="Venue"
                width={180}
                resizable
                sortable
              />
              <Column<BookingAdminDisplayProps>
                key={START_DATE_TIME}
                dataKey={START_DATE_TIME_STRING}
                title="Start"
                width={160}
                resizable
                sortable
              />
              <Column<BookingAdminDisplayProps>
                key={END_DATE_TIME}
                dataKey={END_DATE_TIME_STRING}
                title="End"
                width={160}
                resizable
                sortable
              />
              <Column<BookingAdminDisplayProps>
                key={CREATED_AT}
                dataKey={CREATED_AT_STRING}
                title="Created at"
                width={160}
                resizable
                sortable
              />
              <Column<BookingAdminDisplayProps>
                key={STATUS}
                title="Status"
                width={110}
                sortable
                align="center"
                cellRenderer={statusButtonRenderer}
              />
              <Column<BookingAdminDisplayProps>
                key={ACTION}
                title="Action"
                width={100}
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
