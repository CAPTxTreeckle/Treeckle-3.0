import clsx from "clsx";
import { Link, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { Dropdown, Image, Menu } from "semantic-ui-react";

import defaultAvatarImage from "../../../assets/avatar.png";
import { USER_ID } from "../../../constants";
import { useDeepEqualAppSelector } from "../../../redux/hooks";
import { selectCurrentUserDisplayInfo } from "../../../redux/slices/current-user-slice";
import { resetAppState } from "../../../redux/store";
import { PROFILE_PATH } from "../../../routes/paths";

function UserTab() {
  const { id, name, profileImage } =
    useDeepEqualAppSelector(selectCurrentUserDisplayInfo) ?? {};
  const { pathname } = useLocation();
  const currentUserProfilePath = PROFILE_PATH.replace(`:${USER_ID}`, `${id}`);
  const isShowingCurrentUserProfile = pathname.startsWith(
    currentUserProfilePath,
  );

  const onSignOut = () => {
    resetAppState();
    toast.success("Signed out successfully.");
  };

  return (
    <Menu.Menu position="right">
      <Menu.Item content={<strong>{name}</strong>} />

      <Dropdown
        className={clsx({ active: isShowingCurrentUserProfile })}
        trigger={
          <Image
            src={profileImage || defaultAvatarImage}
            alt=""
            avatar
            bordered
            size="mini"
          />
        }
        icon={null}
        floating
        item
      >
        <Dropdown.Menu>
          <Dropdown.Item
            as={Link}
            to={currentUserProfilePath}
            active={isShowingCurrentUserProfile}
            text="My Profile"
            icon="user"
          />
          <Dropdown.Item onClick={onSignOut} text="Sign Out" icon="sign-out" />
        </Dropdown.Menu>
      </Dropdown>
    </Menu.Menu>
  );
}

export default UserTab;
