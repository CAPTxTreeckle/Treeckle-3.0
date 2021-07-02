import { capitalCase } from "change-case";
import { useEffect, useMemo } from "react";
import { Column } from "react-base-table";
import { Segment, Popup, Button } from "semantic-ui-react";
import {
  CREATED_AT_STRING,
  ID,
  EMAIL,
  CREATED_AT,
  ROLE,
  ACTIONS,
} from "../../constants";
import { useGetUserInvites } from "../../custom-hooks/api/users-api";
import useTableState, {
  TableStateOptions,
} from "../../custom-hooks/use-table-state";
import { displayDateTime } from "../../utils/parser-utils";
import HorizontalLayoutContainer from "../horizontal-layout-container";
import PlaceholderWrapper from "../placeholder-wrapper";
import SearchBar from "../search-bar";
import UserBaseTable, { UserViewProps } from "../user-base-table";
import UserEmailRenderer from "../user-email-renderer";

type UserInviteViewProps = UserViewProps;

const userTableStateOptions: TableStateOptions = {
  searchKeys: [ID, EMAIL, CREATED_AT_STRING, ROLE],
};

function UserInviteTable() {
  const { userInvites, loading, getUserInvites } = useGetUserInvites();

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

  const {
    processedData: processedBookings,
    sortBy,
    setSortBy,
    onSearchValueChange,
  } = useTableState(userInviteViewData, userTableStateOptions);

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
          />
        </HorizontalLayoutContainer>
      </Segment>

      <UserBaseTable<UserInviteViewProps>
        data={processedBookings}
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
        />
      </UserBaseTable>
    </Segment.Group>
  );
}

export default UserInviteTable;
