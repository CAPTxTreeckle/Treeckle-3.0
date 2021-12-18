import { capitalCase } from "change-case";
import { useCallback, useEffect, useMemo } from "react";
import { Column } from "react-base-table";
import { toast } from "react-toastify";
import { Button, Icon, Popup, Segment } from "semantic-ui-react";

import {
  ACTIONS,
  CREATED_AT,
  CREATED_AT_STRING,
  EMAIL,
  ID,
  NAME,
  ROLE,
} from "../../constants";
import {
  useDeleteUser,
  useGetUsers,
  useUpdateUser,
} from "../../custom-hooks/api/users-api";
import useTableState, {
  TableStateOptions,
} from "../../custom-hooks/use-table-state";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import {
  deleteUserAction,
  selectUsers,
  setUsersAction,
  updateUserAction,
} from "../../redux/slices/users-slice";
import { UserData } from "../../types/users";
import { resolveApiError } from "../../utils/error-utils";
import { displayDateTime } from "../../utils/parser-utils";
import { ConfirmationModalPropsGetter } from "../confirmation-modal";
import ConfirmationModalButton from "../confirmation-modal-button";
import HorizontalLayoutContainer from "../horizontal-layout-container";
import PlaceholderWrapper from "../placeholder-wrapper";
import SearchBar from "../search-bar";
import UserBaseTable, { UserViewProps } from "../user-base-table";
import UserEmailRenderer from "../user-email-renderer";
import UserNameRenderer from "../user-name-renderer";
import UserRoleChangeButton from "../user-role-change-button";

type ExistingUserViewProps = UserViewProps & UserData;

const USER_TABLE_STATE_OPTIONS: TableStateOptions = {
  searchKeys: [ID, NAME, EMAIL, CREATED_AT_STRING, ROLE],
};

const ActionButtons = ({ id, role, email, isSelf }: ExistingUserViewProps) => {
  const { updateUser: _updateUser } = useUpdateUser();
  const { deleteUser, loading } = useDeleteUser();
  const dispatch = useAppDispatch();

  const updateUser = useCallback(
    async (data: Parameters<typeof _updateUser>[1]) => {
      try {
        const updatedUser = await _updateUser(id, data);

        toast.success("The user's role has been updated successfully.");

        dispatch(updateUserAction(updatedUser));
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (error: any) {
        resolveApiError(error);
      }
    },
    [dispatch, _updateUser, id],
  );

  const getDeleteUserModalProps: ConfirmationModalPropsGetter = useCallback(
    ({ hideModal }) => ({
      title: "Delete Existing User",
      content: `Are you sure you want to the delete existing user (${email})?`,
      yesButtonProps: {
        disabled: loading,
        loading,
        onClick: async () => {
          if (loading) {
            return;
          }

          try {
            const { id: deletedUserId } = await deleteUser(id);

            dispatch(deleteUserAction(deletedUserId));
            toast.success("The user has been deleted successfully.");
            hideModal();
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
          } catch (error: any) {
            resolveApiError(error);
          }
        },
      },
      icon: <Icon name="trash alternate outline" />,
    }),
    [email, loading, id, deleteUser, dispatch],
  );

  return (
    <>
      <UserRoleChangeButton
        role={role}
        updateRole={updateUser}
        compact
        disabled={isSelf}
      />
      <ConfirmationModalButton
        getConfirmationModalProps={getDeleteUserModalProps}
        compact
        disabled={isSelf || loading}
        loading={loading}
        icon="trash alternate"
        color="red"
      />
    </>
  );
};

function UserTable() {
  const { loading, getUsers: _getUsers } = useGetUsers();
  const users = useAppSelector(selectUsers);
  const dispatch = useAppDispatch();

  const getUsers = useCallback(async () => {
    const users = await _getUsers();
    dispatch(setUsersAction(users));
  }, [_getUsers, dispatch]);

  useEffect(() => {
    getUsers();
  }, [getUsers]);

  const userViewData: ExistingUserViewProps[] = useMemo(
    () =>
      users.map((user) => ({
        ...user,
        [CREATED_AT_STRING]: displayDateTime(user.createdAt),
      })),
    [users],
  );

  const { processedData, sortBy, setSortBy, onSearchValueChange } =
    useTableState(userViewData, USER_TABLE_STATE_OPTIONS);

  return (
    <Segment.Group raised>
      <Segment secondary>
        <HorizontalLayoutContainer>
          <SearchBar fluid onSearchValueChange={onSearchValueChange} />
          <Popup
            content="Refresh"
            trigger={
              <Button
                icon="redo alternate"
                color="blue"
                onClick={getUsers}
                disabled={loading}
                loading={loading}
              />
            }
            position="top center"
            hideOnScroll
          />
        </HorizontalLayoutContainer>
      </Segment>

      <UserBaseTable<ExistingUserViewProps>
        data={processedData}
        emptyRenderer={() => (
          <PlaceholderWrapper
            showDefaultMessage={!loading}
            defaultMessage="No existing users found"
            placeholder
          />
        )}
        overlayRenderer={
          <PlaceholderWrapper
            dimmed
            placeholder
            loading={loading}
            fillParent
            loadingMessage="Retrieving existing users"
          />
        }
        sortBy={sortBy}
        setSortBy={setSortBy}
      >
        <Column<ExistingUserViewProps>
          key={ID}
          dataKey={ID}
          title="ID"
          width={80}
          resizable
          sortable
          align="center"
        />
        <Column<ExistingUserViewProps>
          key={NAME}
          title="Name"
          width={280}
          resizable
          sortable
          cellRenderer={UserNameRenderer}
        />
        <Column<ExistingUserViewProps>
          key={EMAIL}
          title="Email"
          width={300}
          resizable
          sortable
          cellRenderer={UserEmailRenderer}
        />
        <Column<ExistingUserViewProps>
          key={CREATED_AT}
          dataKey={CREATED_AT_STRING}
          title="Created at"
          width={300}
          resizable
          sortable
        />
        <Column<ExistingUserViewProps>
          key={ROLE}
          title="Role"
          sortable
          resizable
          width={150}
          dataGetter={({ rowData: { role } }) => capitalCase(role)}
        />
        <Column<ExistingUserViewProps>
          key={ACTIONS}
          title="Actions"
          align="center"
          resizable
          width={150}
          cellRenderer={({ rowData }) => <ActionButtons {...rowData} />}
        />
      </UserBaseTable>
    </Segment.Group>
  );
}

export default UserTable;
