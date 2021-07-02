import { useEffect, useMemo } from "react";
import { capitalCase } from "change-case";
import { Column } from "react-base-table";
import { Button, Popup, Segment } from "semantic-ui-react";
import {
  ACTIONS,
  CREATED_AT,
  CREATED_AT_STRING,
  EMAIL,
  ID,
  NAME,
  ROLE,
} from "../../constants";
import { useGetUsers } from "../../custom-hooks/api/users-api";
import useTableState, {
  TableStateOptions,
} from "../../custom-hooks/use-table-state";
import { UserData } from "../../types/users";
import { displayDateTime } from "../../utils/parser-utils";
import HorizontalLayoutContainer from "../horizontal-layout-container";
import PlaceholderWrapper from "../placeholder-wrapper";
import SearchBar from "../search-bar";
import UserBaseTable, { UserViewProps } from "../user-base-table";
import UserEmailRenderer from "../user-email-renderer";
import UserNameRenderer from "../user-name-renderer";

type ExistingUserViewProps = UserViewProps & UserData;

const userTableStateOptions: TableStateOptions = {
  searchKeys: [ID, NAME, EMAIL, CREATED_AT_STRING, ROLE],
};

function UserTable() {
  const { users, loading, getUsers } = useGetUsers();

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
        />
      </UserBaseTable>
    </Segment.Group>
  );
}

export default UserTable;
