import { useCallback, useState } from "react";
import { AutoResizer, Column, ColumnShape, RowKey } from "react-base-table";
import { Segment } from "semantic-ui-react";

import {
  ACTION,
  CREATED_AT_STRING,
  EVENT_TIME_RANGE,
  ID,
  START_DATE_TIME_STRING,
  START_TIME_MINS,
  STATUS,
} from "../../constants";
import { useGetSingleBooking } from "../../custom-hooks/api/bookings-api";
import { useAppDispatch } from "../../redux/hooks";
import { updateBookingsAction } from "../../redux/slices/bookings-slice";
import { BookingData } from "../../types/bookings";
import BookingDetailsView from "../booking-details-view";
import BookingStatusButton from "../booking-status-button";
import Table, { TableProps } from "../table";
import styles from "./booking-base-table.module.scss";

export type BookingViewProps = BookingData & {
  [START_TIME_MINS]: number;
  [START_DATE_TIME_STRING]: string;
  [EVENT_TIME_RANGE]: string;
  [CREATED_AT_STRING]: string;
  booking?: BookingData;
  children: { [ID]: string; booking: BookingData }[];
};

type Props = Partial<TableProps<BookingViewProps>> & {
  adminView?: boolean;
  defaultStatusColumnWidth?: number;
  defaultActionColumnWidth?: number;
};

const RowRenderer: TableProps<BookingViewProps>["rowRenderer"] = ({
  rowData: { booking },
  cells,
  columns,
}: {
  rowData: BookingViewProps;
  cells: React.ReactNode[];
  columns: ColumnShape<BookingViewProps>;
}) =>
  // Only render details if there are booking details
  // and the column is not the frozen column
  booking && columns.length > 1 ? (
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

  children,
  ...props
}: Props) {
  const { getSingleBooking } = useGetSingleBooking();
  const dispatch = useAppDispatch();

  const StatusButtonRenderer: ColumnShape<BookingViewProps>["cellRenderer"] =
    useCallback(
      ({ rowData: { status, id } }: { rowData: BookingViewProps }) =>
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

  const [expandedRowKeys, setExpandedRowKeys] = useState<RowKey[]>([]);
  const onRowExpand: TableProps<BookingViewProps>["onRowExpand"] = ({
    expanded,
    rowData: { id, formResponseData },
  }) => {
    if (!expanded || formResponseData) {
      return;
    }
    getSingleBooking(id)
      .then((booking) => {
        if (booking) {
          dispatch(updateBookingsAction({ bookings: [booking] }));
        } else {
          console.error("Failed to update booking details for booking ID", id);
        }
      })
      .catch((error) => console.error(error));
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
            expandedRowKeys={expandedRowKeys}
            rowEventHandlers={{
              onClick: ({ rowData, rowKey, rowIndex }) => {
                if (!rowData.children || rowData.children.length === 0) return;
                if (expandedRowKeys.includes(rowKey))
                  setExpandedRowKeys(
                    expandedRowKeys.filter((x) => x !== rowKey),
                  );
                else {
                  setExpandedRowKeys([...expandedRowKeys, rowKey]);
                  onRowExpand({ expanded: true, rowData, rowIndex, rowKey });
                }
              },
            }}
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
              title=""
              width={defaultActionColumnWidth}
              align="center"
              frozen="right"
            />
          </Table>
        )}
      </AutoResizer>
    </Segment>
  );
}

export default BookingBaseTable;
