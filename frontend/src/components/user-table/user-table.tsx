import { useCallback, useEffect, useMemo } from "react";
import { capitalCase } from "change-case";
import { Column } from "react-base-table";
import { Button, Popup, Segment } from "semantic-ui-react";
import { toast } from "react-toastify";
import {
  ACTIONS,
  CREATED_AT,
  CREATED_AT_STRING,
  EMAIL,
  ID,
  NAME,
  ROLE,
} from "../../constants";
import { useGetUsers, useUpdateUser } from "../../custom-hooks/api/users-api";
import useTableState, {
  TableStateOptions,
} from "../../custom-hooks/use-table-state";
import { Role, UserData } from "../../types/users";
import { displayDateTime } from "../../utils/parser-utils";
import HorizontalLayoutContainer from "../horizontal-layout-container";
import PlaceholderWrapper from "../placeholder-wrapper";
import SearchBar from "../search-bar";
import UserBaseTable, { UserViewProps } from "../user-base-table";
import UserEmailRenderer from "../user-email-renderer";
import UserNameRenderer from "../user-name-renderer";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import DeleteButton from "../delete-button";
import UserRoleChangeButton from "../user-role-change-button";
import {
  selectUsers,
  setUsersAction,
  updateUserAction,
} from "../../redux/slices/users-slice";
import { selectCurrentUserId } from "../../redux/slices/current-user-slice";
import { resolveApiError } from "../../utils/error-utils";

type ExistingUserViewProps = UserViewProps & UserData;

const userTableStateOptions: TableStateOptions = {
  searchKeys: [ID, NAME, EMAIL, CREATED_AT_STRING, ROLE],
};

const ActionButtons = ({ id, role }: { id: number; role: Role }) => {
  const { updateUser: _updateUser } = useUpdateUser();
  const userId = useAppSelector(selectCurrentUserId);
  const dispatch = useAppDispatch();

  const updateUser = useCallback(
    async (data: Parameters<typeof _updateUser>["1"]) => {
      try {
        const updatedUser = await _updateUser(id, data);

        toast.success("The user's role has been updated successfully.");
        dispatch(updateUserAction(updatedUser));
      } catch (error) {
        resolveApiError(error);
      }
    },
    [dispatch, _updateUser, id],
  );

  return (
    <>
      <UserRoleChangeButton
        userId={id}
        role={role}
        updateRole={updateUser}
        compact
        disabled={userId === id}
      />
      <DeleteButton compact />
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

  const {
    processedData: processedBookings,
    sortBy,
    setSortBy,
    onSearchValueChange,
  } = useTableState(userViewData, userTableStateOptions);

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
        data={processedBookings}
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
          cellRenderer={({ rowData: { id, role } }) => (
            <ActionButtons id={id} role={role} />
          )}
        />
      </UserBaseTable>
    </Segment.Group>
  );
}

export default UserTable;
