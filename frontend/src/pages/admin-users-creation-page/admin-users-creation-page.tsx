import { Link } from "react-router-dom";
import { Button, Icon } from "semantic-ui-react";
import { ADMIN_USERS_PATH } from "../../routes/paths";
import UserCreationInputSection from "../../components/user-creation-input-section";
import UserCreationTableDescriptionSection from "../../components/user-creation-table-description-section";
import UserCreationTable from "../../components/user-creation-table";

function AdminUsersCreationPage() {
  return (
    <>
      <Button
        animated="vertical"
        fluid
        color="red"
        as={Link}
        to={ADMIN_USERS_PATH}
      >
        <Button.Content hidden content="Cancel User Creation" />
        <Button.Content visible content={<Icon name="close" fitted />} />
      </Button>

      <h1>User Creation</h1>

      <UserCreationInputSection />

      <h1>Pending Creation Users</h1>

      <UserCreationTableDescriptionSection />

      <UserCreationTable />
    </>
  );
}

export default AdminUsersCreationPage;
