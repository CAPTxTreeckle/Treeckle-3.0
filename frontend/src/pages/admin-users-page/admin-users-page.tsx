import { Link } from "react-router-dom";
import { Button, Icon } from "semantic-ui-react";
import { ADMIN_USERS_CREATION_PATH } from "../../routes/paths";
import Tab, { TabOption } from "../../components/tab";
import UserTable from "../../components/user-table";
import UserInviteTable from "../../components/user-invite-table";

const options: TabOption[] = [
  {
    title: "Existing Users",
    name: "Existing",
    pane: <UserTable />,
  },
  {
    title: "Pending Registration Users",
    name: "Pending Registration",
    pane: <UserInviteTable />,
  },
];

function AdminUsersPage() {
  return (
    <>
      <Button
        animated="vertical"
        fluid
        color="teal"
        as={Link}
        to={ADMIN_USERS_CREATION_PATH}
      >
        <Button.Content hidden content="Create New Users" />
        <Button.Content visible content={<Icon name="add" fitted />} />
      </Button>

      <Tab options={options} />
    </>
  );
}

export default AdminUsersPage;
