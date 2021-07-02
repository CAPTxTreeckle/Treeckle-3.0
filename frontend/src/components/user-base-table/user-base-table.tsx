import { Segment } from "semantic-ui-react";
import { AutoResizer } from "react-base-table";
import Table, { TableProps } from "../table";
import { CREATED_AT_STRING } from "../../constants";
import { UserInviteData } from "../../types/users";
import styles from "./user-base-table.module.scss";

export type UserViewProps = UserInviteData & {
  [CREATED_AT_STRING]: string;
};

type Props<T> = Partial<TableProps<T>>;

function UserBaseTable<T extends UserViewProps>({
  children,
  ...props
}: Props<T>) {
  return (
    <Segment className={styles.userBaseTable}>
      <AutoResizer>
        {({ width, height }) => (
          <Table<T> width={width} height={height} fixed {...props}>
            {children}
          </Table>
        )}
      </AutoResizer>
    </Segment>
  );
}

export default UserBaseTable;
