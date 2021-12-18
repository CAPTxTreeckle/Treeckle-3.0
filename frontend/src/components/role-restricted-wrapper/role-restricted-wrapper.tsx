import { ReactNode } from "react";

import { useDeepEqualAppSelector } from "../../redux/hooks";
import { selectCurrentUserDisplayInfo } from "../../redux/slices/current-user-slice";
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
  const { role } = useDeepEqualAppSelector(selectCurrentUserDisplayInfo) ?? {};

  return <>{role && allowedRoles.includes(role) ? children : defaultRender}</>;
}

export default RoleRestrictedWrapper;
