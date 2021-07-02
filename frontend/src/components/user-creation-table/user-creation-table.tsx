import { useCallback } from "react";
import clsx from "clsx";
import { capitalCase } from "change-case";
import { Button, Segment } from "semantic-ui-react";
import { AutoResizer, Column } from "react-base-table";
import {
  PendingCreationUser,
  USER_CREATION_STATUS_DETAILS,
} from "../../types/users";
import Table, { TableProps } from "../table";
import SearchBar from "../search-bar";
import { ACTION, EMAIL, ID, ROLE, STATUS } from "../../constants";
import useTableState, {
  TableStateOptions,
} from "../../custom-hooks/use-table-state";
import PlaceholderWrapper from "../placeholder-wrapper";
import HorizontalLayoutContainer from "../horizontal-layout-container";
import DeleteButton, { DeleteModalPropsGetter } from "../delete-button";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import {
  resetUserCreationAction,
  selectPendingCreationUsers,
} from "../../redux/slices/user-creation-slice";
import styles from "./user-creation-table.module.scss";

const userCreationTableStateOptions: TableStateOptions = {
  searchKeys: [ID, EMAIL, ROLE, STATUS],
};

const rowClassNameGetter: TableProps<PendingCreationUser>["rowClassName"] = ({
  rowData: { status },
}) => {
  const { classType } = USER_CREATION_STATUS_DETAILS.get(status) ?? {};

  return clsx({
    [styles.positive]: classType === "positive",
    [styles.negative]: classType === "negative",
    [styles.warning]: classType === "warning",
  });
};

function UserCreationTable() {
  const pendingCreationUsers = useAppSelector(selectPendingCreationUsers);
  const dispatch = useAppDispatch();

  const {
    processedData: processedBookings,
    sortBy,
    setSortBy,
    onSearchValueChange,
  } = useTableState(pendingCreationUsers, userCreationTableStateOptions);

  const getClearAllModalProps: DeleteModalPropsGetter = useCallback(
    ({ hideModal }) => ({
      title: "Clear All Pending Creation Users",
      content: "Are you sure you want to clear all pending creation users?",
      onYes: () => {
        dispatch(resetUserCreationAction());
        hideModal();
      },
    }),
    [dispatch],
  );

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
              rowClassName={rowClassNameGetter}
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
                title="Role"
                width={280}
                resizable
                sortable
                dataGetter={({ rowData: { role } }) => capitalCase(role)}
              />

              <Column<PendingCreationUser>
                key={STATUS}
                title="Status"
                width={150}
                resizable
                sortable
                dataGetter={({ rowData: { status } }) => capitalCase(status)}
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
          <DeleteButton
            icon={null}
            popUpContent={null}
            content="Clear All"
            disabled={pendingCreationUsers.length === 0}
            getDeleteModalProps={getClearAllModalProps}
          />
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
