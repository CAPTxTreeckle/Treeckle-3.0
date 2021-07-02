import { ReactNode, useCallback } from "react";
import { AutoResizer, Column } from "react-base-table";
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

const rowRenderer = ({
  rowData: { booking },
  cells,
}: {
  rowData: BookingViewProps;
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

function BookingBaseTable({
  adminView = false,
  defaultStatusColumnWidth = 100,
  defaultActionColumnWidth = 100,
  // eslint-disable-next-line react/prop-types
  children,
  ...props
}: Props) {
  const statusButtonRenderer = useCallback(
    ({
      rowData: { status, id },
    }: {
      // eslint-disable-next-line react/no-unused-prop-types
      rowData: Partial<BookingViewProps>;
    }) =>
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

  return (
    <Segment className={styles.bookingBaseTable}>
      <AutoResizer>
        {({ width, height }) => (
          <Table<BookingViewProps>
            width={width}
            height={height}
            rowRenderer={rowRenderer}
            estimatedRowHeight={50}
            fixed
            expandColumnKey={ACTION}
            {...props}
          >
            {children}
            <Column<BookingViewProps>
              key={STATUS}
              title="Status"
              width={defaultStatusColumnWidth}
              sortable
              align="center"
              cellRenderer={statusButtonRenderer}
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
