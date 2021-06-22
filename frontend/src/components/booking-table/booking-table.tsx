import { ReactNode } from "react";
import { AutoResizer, Column } from "react-base-table";
import { Segment } from "semantic-ui-react";
import Table, { TableProps } from "../table";
import { BookingViewProps } from "../../types/bookings";
import {
  START_DATE_TIME_STRING,
  END_DATE_TIME_STRING,
  CREATED_AT_STRING,
  ID,
  ACTION,
} from "../../constants";
import BookingDetailsView from "../booking-details-view";
import styles from "./booking-table.module.scss";

export type BookingDisplayProps = BookingViewProps & {
  [START_DATE_TIME_STRING]: string;
  [END_DATE_TIME_STRING]: string;
  [CREATED_AT_STRING]: string;
  booking?: BookingViewProps;
  children: [{ [ID]: string; booking: BookingViewProps }];
};

type Props<T> = Partial<TableProps<T>>;

const rowRenderer = ({
  rowData: { booking },
  cells,
}: {
  rowData: BookingDisplayProps;
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

function BookingTable(props: Props<BookingDisplayProps>) {
  return (
    <Segment className={styles.bookingTable}>
      <AutoResizer>
        {({ width, height }) => (
          <Table<BookingDisplayProps>
            width={width}
            height={height}
            rowRenderer={rowRenderer}
            estimatedRowHeight={50}
            fixed
            expandColumnKey={ACTION}
            {...props}
          >
            {props.children}
            <Column<BookingDisplayProps>
              key={ACTION}
              title="Action"
              width={100}
              align="center"
            />
          </Table>
        )}
      </AutoResizer>
    </Segment>
  );
}

export default BookingTable;
