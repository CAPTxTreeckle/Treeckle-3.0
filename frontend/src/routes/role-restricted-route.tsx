import { Redirect, Route, RouteProps } from "react-router-dom";
import { useAppSelector } from "../redux/hooks";
import { getCurrentUserRole } from "../redux/slices/current-user-slice";
import { Role } from "../types/users";
import { HOME_PATH } from "./paths";

type Props = RouteProps & { allowedRoles: Role[] };

function RoleRestrictedRoute(props: Props) {
  const role = useAppSelector(getCurrentUserRole);
  const { allowedRoles } = props;

  return role && allowedRoles.includes(role) ? (
    <Route {...props} />
  ) : (
    <Redirect to={HOME_PATH} />
  );
}

export default RoleRestrictedRoute;
