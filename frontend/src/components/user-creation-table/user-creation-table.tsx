import { useCallback, useMemo, useEffect } from "react";
import clsx from "clsx";
import { capitalCase } from "change-case";
import { toast } from "react-toastify";
import { useModal } from "react-modal-hook";
import { Button, List, Popup, Segment } from "semantic-ui-react";
import { AutoResizer, Column } from "react-base-table";
import {
  PendingCreationUser,
  UserCreationStatus,
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
import BaseModal from "../base-modal";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import {
  removePendingCreationUserAction,
  toggleUnsuccessfullyCreatedUsersAction,
  resetUserCreationAction,
  selectPendingCreationUsers,
  selectUnsuccessfullyCreatedUsers,
  updateNewPendingCreationUsersToCreatedAction,
  updateUnsuccessfullyCreatedUsersAction,
  selectShowUnsuccessfullyCreatedUsers,
} from "../../redux/slices/user-creation-slice";
import { useCreateUserInvites } from "../../custom-hooks/api/users-api";
import { resolveApiError } from "../../utils/error-utils";
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

const ActionButton = ({ id }: { id: number }) => {
  const dispatch = useAppDispatch();

  return (
    <DeleteButton
      compact
      onClick={() => dispatch(removePendingCreationUserAction(id))}
    />
  );
};

function UserCreationTable() {
  const pendingCreationUsers = useAppSelector(selectPendingCreationUsers);
  const unsuccessfullyCreatedUsers = useAppSelector(
    selectUnsuccessfullyCreatedUsers,
  );
  const showUnsuccessfullyCreatedUsers = useAppSelector(
    selectShowUnsuccessfullyCreatedUsers,
  );
  const dispatch = useAppDispatch();
  const { createUserInvites, loading } = useCreateUserInvites();

  const [showModal, hideModal] = useModal(
    ({ in: open, onExited }) => (
      <BaseModal
        open={open}
        onExited={onExited}
        onClose={() => {
          hideModal();
          dispatch(toggleUnsuccessfullyCreatedUsersAction(false));
        }}
        title="Unsuccessfully Created Users"
        content={
          <>
            <h3>{`The following user${
              unsuccessfullyCreatedUsers.length === 1 ? " was" : "s were"
            } not created successfully:`}</h3>
            <List ordered>
              {unsuccessfullyCreatedUsers.map(({ email }, index) => (
                <List.Item key={`${index}-${email}`}>{email}</List.Item>
              ))}
            </List>
          </>
        }
      />
    ),
    [unsuccessfullyCreatedUsers],
  );

  useEffect(() => {
    if (
      showUnsuccessfullyCreatedUsers &&
      unsuccessfullyCreatedUsers.length > 0
    ) {
      showModal();
    }
  }, [unsuccessfullyCreatedUsers, showUnsuccessfullyCreatedUsers, showModal]);

  const {
    processedData: processedBookings,
    sortBy,
    setSortBy,
    onSearchValueChange,
  } = useTableState(pendingCreationUsers, userCreationTableStateOptions);

  const newPendingCreationUsers = useMemo(
    () =>
      pendingCreationUsers.filter(
        ({ status }) => status === UserCreationStatus.New,
      ),
    [pendingCreationUsers],
  );

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

  const onCreateUsers = async () => {
    try {
      const createdUserInvites = await createUserInvites(
        newPendingCreationUsers.map(({ email, role }) => ({ email, role })),
      );

      dispatch(
        updateNewPendingCreationUsersToCreatedAction(createdUserInvites),
      );

      toast.success("New user(s) created successfully.");
    } catch (error) {
      resolveApiError(error);
    } finally {
      dispatch(updateUnsuccessfullyCreatedUsersAction());
    }
  };

  return (
    <Segment.Group raised>
      <Segment secondary>
        <HorizontalLayoutContainer>
          <SearchBar fluid onSearchValueChange={onSearchValueChange} />
          <Popup
            content="View unsuccessfully created users"
            wide
            trigger={
              <Button
                icon="eye"
                color="blue"
                onClick={() =>
                  dispatch(toggleUnsuccessfullyCreatedUsersAction(true))
                }
                disabled={unsuccessfullyCreatedUsers.length === 0}
              />
            }
          />
        </HorizontalLayoutContainer>
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
              estimatedRowHeight={50}
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
                dataKey={ID}
                title="Action"
                width={150}
                resizable
                align="center"
                cellRenderer={({ cellData }) => (
                  <ActionButton id={cellData as number} />
                )}
              />
            </Table>
          )}
        </AutoResizer>
      </Segment>

      <Segment secondary>
        <HorizontalLayoutContainer justify="end">
          <DeleteButton
            icon={null}
            popupContent={null}
            content="Clear All"
            disabled={pendingCreationUsers.length === 0}
            getDeleteModalProps={getClearAllModalProps}
          />
          <Button
            content="Create Users"
            color="blue"
            onClick={onCreateUsers}
            loading={loading}
            disabled={newPendingCreationUsers.length === 0 || loading}
          />
        </HorizontalLayoutContainer>
      </Segment>
    </Segment.Group>
  );
}

export default UserCreationTable;
