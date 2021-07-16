import { Route, RouteProps } from "react-router-dom";
import { useDeepEqualAppSelector } from "../redux/hooks";
import { selectCurrentUserDisplayInfo } from "../redux/slices/current-user-slice";
import { Role } from "../types/users";

type Props = RouteProps & { allowedRoles: Role[] };

function RoleRestrictedRoute({ allowedRoles, ...props }: Props) {
  const { role } = useDeepEqualAppSelector(selectCurrentUserDisplayInfo) ?? {};

  return role && allowedRoles.includes(role) ? <Route {...props} /> : null;
}

export default RoleRestrictedRoute;
