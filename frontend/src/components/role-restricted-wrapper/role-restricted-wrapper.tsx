import { ReactNode } from "react";
import isEqual from "lodash/isEqual";
import { useAppSelector } from "../../redux/hooks";
import { getCurrentUserDisplayInfo } from "../../redux/slices/current-user-slice";
import { Role } from "../../types/users";

type Props = {
  children: ReactNode;
  allowedRoles: Role[];
  defaultRender?: ReactNode;
};

function RoleRestrictedWrapper({
  children,
  allowedRoles,
  defaultRender = null,
}: Props) {
  const { role } = useAppSelector(getCurrentUserDisplayInfo, isEqual);

  return <>{role && allowedRoles.includes(role) ? children : defaultRender}</>;
}

export default RoleRestrictedWrapper;
