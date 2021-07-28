import { capitalCase } from "change-case";
import { useCallback, useEffect, useMemo } from "react";
import { Column } from "react-base-table";
import { toast } from "react-toastify";
import { Segment, Popup, Button } from "semantic-ui-react";
import {
  CREATED_AT_STRING,
  ID,
  EMAIL,
  CREATED_AT,
  ROLE,
  ACTIONS,
} from "../../constants";
import {
  useDeleteUserInvite,
  useGetUserInvites,
  useUpdateUserInvite,
} from "../../custom-hooks/api/users-api";
import useTableState, {
  TableStateOptions,
} from "../../custom-hooks/use-table-state";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import {
  deleteUserInviteAction,
  selectUserInvites,
  setUserInvitesAction,
  updateUserInviteAction,
} from "../../redux/slices/user-invites-slice";
import { resolveApiError } from "../../utils/error-utils";
import { displayDateTime } from "../../utils/parser-utils";
import DeleteButton, { DeleteModalPropsGetter } from "../delete-button";
import HorizontalLayoutContainer from "../horizontal-layout-container";
import PlaceholderWrapper from "../placeholder-wrapper";
import SearchBar from "../search-bar";
import UserBaseTable, { UserViewProps } from "../user-base-table";
import UserEmailRenderer from "../user-email-renderer";
import UserRoleChangeButton from "../user-role-change-button";

type UserInviteViewProps = UserViewProps;

const USER_TABLE_STATE_OPTIONS: TableStateOptions = {
  searchKeys: [ID, EMAIL, CREATED_AT_STRING, ROLE],
};

const ActionButtons = ({ id, role, email }: UserInviteViewProps) => {
  const { updateUserInvite: _updateUserInvite } = useUpdateUserInvite();
  const { deleteUserInvite, loading } = useDeleteUserInvite();
  const dispatch = useAppDispatch();

  const updateUserInvite = useCallback(
    async (data: Parameters<typeof _updateUserInvite>[1]) => {
      try {
        const updatedUserInvite = await _updateUserInvite(id, data);

        dispatch(updateUserInviteAction(updatedUserInvite));

        toast.success("The user's role has been updated successfully.");
      } catch (error) {
        resolveApiError(error);
      }
    },
    [dispatch, _updateUserInvite, id],
  );

  const getDeleteUserInviteModalProps: DeleteModalPropsGetter = useCallback(
    ({ hideModal }) => ({
      title: "Delete Pending Registration User",
      content: `Are you sure you want to delete the pending registration user (${email})?`,
      yesButtonProps: {
        disabled: loading,
        loading,
        onClick: async () => {
          try {
            const { id: deletedUserInviteId } = await deleteUserInvite(id);

            toast.success("The user has been deleted successfully.");

            dispatch(deleteUserInviteAction(deletedUserInviteId));
            hideModal();
          } catch (error) {
            resolveApiError(error);
          }
        },
      },
    }),
    [email, loading, id, deleteUserInvite, dispatch],
  );

  return (
    <>
      <UserRoleChangeButton
        userId={id}
        role={role}
        updateRole={updateUserInvite}
        compact
      />
      <DeleteButton
        getDeleteModalProps={getDeleteUserInviteModalProps}
        compact
      />
    </>
  );
};

function UserInviteTable() {
  const { loading, getUserInvites: _getUserInvites } = useGetUserInvites();
  const userInvites = useAppSelector(selectUserInvites);
  const dispatch = useAppDispatch();

  const getUserInvites = useCallback(async () => {
    const userInvites = await _getUserInvites();
    dispatch(setUserInvitesAction(userInvites));
  }, [_getUserInvites, dispatch]);

  useEffect(() => {
    getUserInvites();
  }, [getUserInvites]);

  const userInviteViewData: UserInviteViewProps[] = useMemo(
    () =>
      userInvites.map((userInvite) => ({
        ...userInvite,
        [CREATED_AT_STRING]: displayDateTime(userInvite.createdAt),
      })),
    [userInvites],
  );

  const { processedData, sortBy, setSortBy, onSearchValueChange } =
    useTableState(userInviteViewData, USER_TABLE_STATE_OPTIONS);

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
                onClick={getUserInvites}
                disabled={loading}
                loading={loading}
              />
            }
            position="top center"
            hideOnScroll
          />
        </HorizontalLayoutContainer>
      </Segment>

      <UserBaseTable<UserInviteViewProps>
        data={processedData}
        emptyRenderer={() => (
          <PlaceholderWrapper
            showDefaultMessage={!loading}
            defaultMessage="No pending registration users found"
            placeholder
          />
        )}
        overlayRenderer={
          <PlaceholderWrapper
            dimmed
            placeholder
            loading={loading}
            fillParent
            loadingMessage="Retrieving pending registration users"
          />
        }
        sortBy={sortBy}
        setSortBy={setSortBy}
      >
        <Column<UserInviteViewProps>
          key={ID}
          dataKey={ID}
          title="ID"
          width={80}
          resizable
          sortable
          align="center"
        />
        <Column<UserInviteViewProps>
          key={EMAIL}
          title="Email"
          width={480}
          resizable
          sortable
          cellRenderer={UserEmailRenderer}
        />
        <Column<UserInviteViewProps>
          key={CREATED_AT}
          dataKey={CREATED_AT_STRING}
          title="Created at"
          width={400}
          resizable
          sortable
        />
        <Column<UserInviteViewProps>
          key={ROLE}
          title="Role"
          sortable
          resizable
          width={150}
          dataGetter={({ rowData: { role } }) => capitalCase(role)}
        />
        <Column<UserInviteViewProps>
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

export default UserInviteTable;
