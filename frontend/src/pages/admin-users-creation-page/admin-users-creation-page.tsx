import { Link } from "react-router-dom";
import { useLastLocation } from "react-router-last-location";
import { Button, Icon } from "semantic-ui-react";

import UserCreationInputSection from "../../components/user-creation-input-section";
import UserCreationTable from "../../components/user-creation-table";
import { ADMIN_USERS_PATH } from "../../routes/paths";

function AdminUsersCreationPage() {
  const lastLocation = useLastLocation();

  return (
    <>
      <Button
        animated="vertical"
        fluid
        color="red"
        as={Link}
        to={lastLocation?.pathname ?? ADMIN_USERS_PATH}
      >
        <Button.Content hidden content="Cancel User Creation" />
        <Button.Content visible content={<Icon name="close" fitted />} />
      </Button>

      <h1>User Creation</h1>

      <UserCreationInputSection />

      <h1>Pending Creation Users</h1>

      <UserCreationTable />
    </>
  );
}

export default AdminUsersCreationPage;
