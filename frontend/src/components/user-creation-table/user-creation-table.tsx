import { capitalCase } from "change-case";
import clsx from "clsx";
import { useCallback, useEffect, useMemo } from "react";
import { AutoResizer, Column } from "react-base-table";
import { useModal } from "react-modal-hook";
import { toast } from "react-toastify";
import { Button, Icon, List, Popup, Segment } from "semantic-ui-react";

import { ACTION, EMAIL, ID, ROLE, STATUS } from "../../constants";
import { useCreateUserInvites } from "../../custom-hooks/api/users-api";
import useTableState, {
  TableStateOptions,
} from "../../custom-hooks/use-table-state";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import {
  removePendingCreationUserAction,
  resetUserCreationAction,
  selectPendingCreationUsers,
  selectShowUnsuccessfullyCreatedUsers,
  selectUnsuccessfullyCreatedUsers,
  toggleUnsuccessfullyCreatedUsersAction,
  updateNewPendingCreationUsersToCreatedAction,
  updateUnsuccessfullyCreatedUsersAction,
} from "../../redux/slices/user-creation-slice";
import {
  PendingCreationUser,
  USER_CREATION_STATUS_DETAILS,
  UserCreationStatus,
} from "../../types/users";
import { resolveApiError } from "../../utils/error-utils";
import BaseModal from "../base-modal";
import { ConfirmationModalPropsGetter } from "../confirmation-modal";
import ConfirmationModalButton from "../confirmation-modal-button";
import HorizontalLayoutContainer from "../horizontal-layout-container";
import PlaceholderWrapper from "../placeholder-wrapper";
import SearchBar from "../search-bar";
import Table, { TableProps } from "../table";
import UserCreationTableDescriptionSection from "../user-creation-table-description-section";
import styles from "./user-creation-table.module.scss";

const USER_CREATION_TABLE_STATE_OPTIONS: TableStateOptions = {
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

const ActionButton = ({ id }: PendingCreationUser) => {
  const dispatch = useAppDispatch();

  return (
    <Button
      compact
      onClick={() => dispatch(removePendingCreationUserAction(id))}
      icon="trash alternate"
      color="red"
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

  const { processedData, sortBy, setSortBy, onSearchValueChange } =
    useTableState(pendingCreationUsers, USER_CREATION_TABLE_STATE_OPTIONS);

  const newPendingCreationUsers = useMemo(
    () =>
      pendingCreationUsers.filter(
        ({ status }) => status === UserCreationStatus.New,
      ),
    [pendingCreationUsers],
  );

  const getClearAllModalProps: ConfirmationModalPropsGetter = useCallback(
    ({ hideModal }) => ({
      title: "Clear All Pending Creation Users",
      content: "Are you sure you want to clear all pending creation users?",
      yesButtonProps: {
        onClick: () => {
          dispatch(resetUserCreationAction());
          hideModal();
        },
      },
      icon: <Icon name="trash alternate outline" />,
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

      toast.success(
        `New user${
          createdUserInvites.length === 1 ? "" : "s"
        } created successfully.`,
      );
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      resolveApiError(error);
    } finally {
      dispatch(updateUnsuccessfullyCreatedUsersAction());
    }
  };

  return (
    <Segment.Group raised>
      <UserCreationTableDescriptionSection />

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
            on="hover"
          />
        </HorizontalLayoutContainer>
      </Segment>

      <Segment className={styles.userCreationTable}>
        <AutoResizer>
          {({ width, height }) => (
            <Table<PendingCreationUser>
              data={processedData}
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
                title="Action"
                width={150}
                resizable
                align="center"
                cellRenderer={({ rowData }) => <ActionButton {...rowData} />}
              />
            </Table>
          )}
        </AutoResizer>
      </Segment>

      <Segment secondary>
        <HorizontalLayoutContainer justify="end">
          <ConfirmationModalButton
            content="Clear All"
            disabled={pendingCreationUsers.length === 0}
            getConfirmationModalProps={getClearAllModalProps}
            color="red"
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
