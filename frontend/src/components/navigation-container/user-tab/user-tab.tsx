import clsx from "clsx";
import isEqual from "lodash/isEqual";
import { Link, useLocation } from "react-router-dom";
import { Dropdown, Menu, Image } from "semantic-ui-react";
import { toast } from "react-toastify";
import { PROFILE_PATH } from "../../../routes/paths";
import { USER_ID } from "../../../constants";
import { useAppDispatch, useAppSelector } from "../../../redux/hooks";
import {
  updateCurrentUser,
  getCurrentUserDisplayInfo,
} from "../../../redux/slices/current-user-slice";
import defaultAvatarImage from "../../../assets/avatar.png";

function UserTab() {
  const { id, name, profileImage } = useAppSelector(
    getCurrentUserDisplayInfo,
    isEqual,
  );
  const dispatch = useAppDispatch();
  const { pathname } = useLocation();
  const currentUserProfilePath = PROFILE_PATH.replace(`:${USER_ID}`, `${id}`);
  const isShowingCurrentUserProfile = pathname.startsWith(
    currentUserProfilePath,
  );

  const onSignOut = () => {
    dispatch(updateCurrentUser(null));
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
