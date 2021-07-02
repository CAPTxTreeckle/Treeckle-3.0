import { Button, Segment } from "semantic-ui-react";
import { AutoResizer, Column } from "react-base-table";
import { PendingCreationUser } from "../../types/users";
import Table from "../table";
import SearchBar from "../search-bar";
import { ACTION, EMAIL, ID, ROLE, STATUS } from "../../constants";
import useTableState, {
  TableStateOptions,
} from "../../custom-hooks/use-table-state";
import styles from "./user-creation-table.module.scss";
import PlaceholderWrapper from "../placeholder-wrapper";
import HorizontalLayoutContainer from "../horizontal-layout-container";
import { useAppSelector } from "../../redux/hooks";
import { selectPendingCreationUsers } from "../../redux/slices/user-creation-slice";

const userCreationTableStateOptions: TableStateOptions = {
  searchKeys: [ID, EMAIL, ROLE, STATUS],
};

function UserCreationTable() {
  const pendingCreationUsers = useAppSelector(selectPendingCreationUsers);

  const {
    processedData: processedBookings,
    sortBy,
    setSortBy,
    onSearchValueChange,
  } = useTableState(pendingCreationUsers, userCreationTableStateOptions);

  return (
    <Segment.Group raised>
      <Segment secondary>
        <SearchBar fluid onSearchValueChange={onSearchValueChange} />
      </Segment>

      <Segment className={styles.userCreationTable}>
        <AutoResizer>
          {({ width, height }) => (
            <Table<PendingCreationUser>
              data={processedBookings}
              emptyRenderer={() => (
                <PlaceholderWrapper
                  showDefaultMessage
                  defaultMessage="No pending creation users found"
                  placeholder
                />
              )}
              width={width}
              height={height}
              fixed
              sortBy={sortBy}
              setSortBy={setSortBy}
            >
              <Column<PendingCreationUser>
                key={ID}
                dataKey={ID}
                title="ID"
                width={80}
                resizable
                sortable
                align="center"
              />

              <Column<PendingCreationUser>
                key={EMAIL}
                dataKey={EMAIL}
                title="Email"
                width={600}
                resizable
                sortable
              />

              <Column<PendingCreationUser>
                key={ROLE}
                dataKey={ROLE}
                title="Role"
                width={280}
                resizable
                sortable
              />

              <Column<PendingCreationUser>
                key={STATUS}
                dataKey={STATUS}
                title="Status"
                width={150}
                resizable
                sortable
              />

              <Column<PendingCreationUser>
                key={ACTION}
                title="Action"
                width={150}
                resizable
                align="center"
              />
            </Table>
          )}
        </AutoResizer>
      </Segment>

      <Segment secondary>
        <HorizontalLayoutContainer justify="end">
          <Button
            content="Create Users"
            color="blue"
            // onClick={onCreateUsers}
            // loading={isSubmitting}
            // disabled={newPendingCreationUsers.length === 0}
          />
        </HorizontalLayoutContainer>
      </Segment>
    </Segment.Group>
  );
}

export default UserCreationTable;
