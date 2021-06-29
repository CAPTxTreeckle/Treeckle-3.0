import { Link, useHistory, useLocation } from "react-router-dom";
import { Button, Icon } from "semantic-ui-react";
import {
  ADMIN_USERS_CREATION_PATH,
  ADMIN_USERS_PATH,
  ADMIN_USERS_PENDING_REGISTRATION_PATH,
} from "../../routes/paths";
import Tab, { TabOption } from "../../components/tab";
import UserTable from "../../components/user-table";
import UserInviteTable from "../../components/user-invite-table";

const adminUsersCategoryPaths = [
  ADMIN_USERS_PATH,
  ADMIN_USERS_PENDING_REGISTRATION_PATH,
];

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
  const history = useHistory();
  const { pathname } = useLocation();

  const activeIndex = (() => {
    const activeIndex = adminUsersCategoryPaths.indexOf(pathname);

    return activeIndex >= 0 ? activeIndex : 0;
  })();

  const onChange = (selectedIndex: number) => {
    const newPath = adminUsersCategoryPaths[selectedIndex] ?? ADMIN_USERS_PATH;

    if (selectedIndex === activeIndex) {
      return;
    }

    history.push(newPath);
  };

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

      <Tab activeIndex={activeIndex} onChange={onChange} options={options} />
    </>
  );
}

export default AdminUsersPage;
