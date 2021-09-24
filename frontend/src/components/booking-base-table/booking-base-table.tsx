import { useCallback } from "react";
import { AutoResizer, Column, ColumnShape } from "react-base-table";
import { Segment } from "semantic-ui-react";
import Table, { TableProps } from "../table";
import { BookingData } from "../../types/bookings";
import {
  START_DATE_TIME_STRING,
  END_DATE_TIME_STRING,
  CREATED_AT_STRING,
  ID,
  ACTION,
  STATUS,
} from "../../constants";
import BookingDetailsView from "../booking-details-view";
import BookingStatusButton from "../booking-status-button";
import styles from "./booking-base-table.module.scss";
import { useGetSingleBooking } from "../../custom-hooks/api/bookings-api";
import { useAppDispatch } from "../../redux/hooks";
import { updateBookingsAction } from "../../redux/slices/bookings-slice";

export type BookingViewProps = BookingData & {
  [START_DATE_TIME_STRING]: string;
  [END_DATE_TIME_STRING]: string;
  [CREATED_AT_STRING]: string;
  booking?: BookingData;
  children: [{ [ID]: string; booking: BookingData }];
};

type Props = Partial<TableProps<BookingViewProps>> & {
  adminView?: boolean;
  defaultStatusColumnWidth?: number;
  defaultActionColumnWidth?: number;
};

const RowRenderer: TableProps<BookingViewProps>["rowRenderer"] = ({
  // eslint-disable-next-line react/prop-types
  rowData: { booking },
  // eslint-disable-next-line react/prop-types
  cells,
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

function BookingBaseTable({
  adminView = false,
  defaultStatusColumnWidth = 100,
  defaultActionColumnWidth = 100,
  // eslint-disable-next-line react/prop-types
  children,
  ...props
}: Props) {
  const { getSingleBooking } = useGetSingleBooking();
  const dispatch = useAppDispatch();

  const StatusButtonRenderer: ColumnShape<BookingViewProps>["cellRenderer"] =
    useCallback(
      ({ rowData: { status, id } }) =>
        status &&
        id !== undefined && (
          <BookingStatusButton
            bookingId={id}
            status={status}
            adminView={adminView}
          />
        ),
      [adminView],
    );

  const onRowExpand: TableProps<BookingViewProps>["onRowExpand"] = async ({
    expanded,
    rowData: { id, formResponseData },
  }) => {
    if (!expanded || formResponseData) {
      return;
    }

    const booking = await getSingleBooking(id);

    if (booking) {
      dispatch(updateBookingsAction({ bookings: [booking] }));
    }
  };

  return (
    <Segment className={styles.bookingBaseTable}>
      <AutoResizer>
        {({ width, height }) => (
          <Table<BookingViewProps>
            width={width}
            height={height}
            rowRenderer={RowRenderer}
            estimatedRowHeight={50}
            fixed
            expandColumnKey={ACTION}
            onRowExpand={onRowExpand}
            {...props}
          >
            {children}
            <Column<BookingViewProps>
              key={STATUS}
              title="Status"
              width={defaultStatusColumnWidth}
              sortable
              align="center"
              cellRenderer={StatusButtonRenderer}
              resizable
            />
            <Column<BookingViewProps>
              key={ACTION}
              title="Action"
              width={defaultActionColumnWidth}
              align="center"
              resizable
            />
          </Table>
        )}
      </AutoResizer>
    </Segment>
  );
}

export default BookingBaseTable;
