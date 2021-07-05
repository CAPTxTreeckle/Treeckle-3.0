import { useMemo, useState } from "react";
import { Button, ButtonProps, Popup } from "semantic-ui-react";
import { Role, UserInvitePatchData, UserPatchData } from "../../types/users";

type Props = {
  role: Role;
  updateRole:
    | ((data: UserPatchData) => Promise<unknown>)
    | ((data: UserInvitePatchData) => Promise<unknown>);
} & ButtonProps;

function UserRoleChangeButton({ role, updateRole, ...buttonProps }: Props) {
  const [isPopupOpened, setPopupOpened] = useState(false);
  const [isUpdating, setUpdating] = useState(false);

  const actionButtons = useMemo(() => {
    const onUpdateRole = async (role: Role) => {
      setPopupOpened(false);
      setUpdating(true);

      await updateRole({ role });

      setUpdating(false);
    };

    const makeAdminButton = (
      <Button
        key="make-admin"
        content="Make Admin"
        color="blue"
        onClick={() => onUpdateRole(Role.Admin)}
      />
    );

    const makeOrganizerButton = (
      <Button
        key="make-organizer"
        content="Make Organizer"
        color="blue"
        onClick={() => onUpdateRole(Role.Organizer)}
      />
    );

    const makeResidentButton = (
      <Button
        key="make-resident"
        content="Make Resident"
        color="blue"
        onClick={() => onUpdateRole(Role.Resident)}
      />
    );

    switch (role) {
      case Role.Admin:
        return [makeOrganizerButton, makeResidentButton];
      case Role.Organizer:
        return [makeAdminButton, makeResidentButton];
      case Role.Resident:
        return [makeAdminButton, makeOrganizerButton];
      default:
        return [];
    }
  }, [updateRole, role]);

  return (
    <Popup
      trigger={
        <Button
          {...buttonProps}
          icon="users"
          color="black"
          loading={isUpdating}
        />
      }
      position="top center"
      content={
        <Button.Group compact vertical>
          {actionButtons}
        </Button.Group>
      }
      hoverable
      on="click"
      open={isPopupOpened}
      onOpen={() => setPopupOpened(true)}
      onClose={() => setPopupOpened(false)}
      hideOnScroll
      disabled={isUpdating}
    />
  );
}

export default UserRoleChangeButton;
