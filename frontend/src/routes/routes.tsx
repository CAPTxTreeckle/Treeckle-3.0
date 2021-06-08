import {
  BrowserRouter as Router,
  Route,
  Switch,
  Redirect,
} from "react-router-dom";
import { LastLocationProvider } from "react-router-last-location";
import { Role } from "../types/users";
import { useAppSelector } from "../redux/hooks";
import { getIsLoggedIn } from "../redux/slices/current-user-slice";
import RoleRestrictedRoute from "./role-restricted-route";
import {
  DASHBOARD_PATH,
  BOOKINGS_PATH,
  EVENTS_PATH,
  EVENTS_SIGNED_UP_PATH,
  EVENTS_SUBSCRIPTIONS_PATH,
  EVENTS_OWN_PATH,
  EVENTS_CREATION_PATH,
  EVENTS_SINGLE_VIEW_PATH,
  EVENTS_EDIT_PATH,
  EVENTS_QR_CODE_PATH,
  ADMIN_BOOKINGS_PATH,
  ADMIN_SETTINGS_PATH,
  ADMIN_USERS_PATH,
  PROFILE_PATH,
  HOME_PATH,
  ADMIN_VENUES_PATH,
  ADMIN_VENUES_CREATION_PATH,
  ADMIN_VENUES_EDIT_PATH,
  ADMIN_USERS_CREATION_PATH,
  ADMIN_USERS_PENDING_REGISTRATION_PATH,
  BOOKINGS_CREATION_PATH,
} from "./paths";
import DashboardPage from "../components/pages/dashboard-page";
import EventsPage from "../components/pages/events-page";
import BookingsPage from "../components/pages/bookings-page";
import AdminBookingsPage from "../components/pages/admin-bookings-page";
import AdminUsersPage from "../components/pages/admin-users-page";
import AdminSettingsPage from "../components/pages/admin-settings-page";
import ProfilePage from "../components/pages/profile-page";
import HomePage from "../components/pages/home-page";
import AdminVenuesPage from "../components/pages/admin-venues-page";
import AdminVenuesCreationPage from "../components/pages/admin-venues-creation-page";
import AdminVenuesEditPage from "../components/pages/admin-venues-edit-page";
import EventsCreationPage from "../components/pages/events-creation-page";
import EventsSingleViewPage from "../components/pages/events-single-view-page";
import EventsEditPage from "../components/pages/events-edit-page";
import EventsQrCodePage from "../components/pages/events-qr-code-page";
import AdminUsersCreationPage from "../components/pages/admin-users-creation-page";
import BookingsCreationPage from "../components/pages/bookings-creation-page";

function Routes() {
  const isLoggedIn = useAppSelector(getIsLoggedIn);

  return (
    <Router>
      <LastLocationProvider>
        <Switch>
          <Route path={HOME_PATH} exact>
            {isLoggedIn ? <Redirect to={DASHBOARD_PATH} /> : <HomePage />}
          </Route>

          {!isLoggedIn && <Redirect to={HOME_PATH} />}

          <Route path={DASHBOARD_PATH} exact strict>
            <DashboardPage />
          </Route>

          <Route path={BOOKINGS_PATH} exact strict>
            <BookingsPage />
          </Route>

          <Route path={BOOKINGS_CREATION_PATH} exact strict>
            <BookingsCreationPage />
          </Route>

          <Route path={PROFILE_PATH} exact strict>
            <ProfilePage />
          </Route>

          <Route
            path={[
              EVENTS_PATH,
              EVENTS_SIGNED_UP_PATH,
              EVENTS_SUBSCRIPTIONS_PATH,
            ]}
            exact
            strict
          >
            <EventsPage />
          </Route>

          <RoleRestrictedRoute
            allowedRoles={[Role.Organizer, Role.Admin]}
            path={EVENTS_OWN_PATH}
            exact
            strict
          >
            <EventsPage />
          </RoleRestrictedRoute>

          <RoleRestrictedRoute
            allowedRoles={[Role.Organizer, Role.Admin]}
            path={EVENTS_CREATION_PATH}
            exact
            strict
          >
            <EventsCreationPage />
          </RoleRestrictedRoute>

          <Route path={EVENTS_SINGLE_VIEW_PATH} exact strict>
            <EventsSingleViewPage />
          </Route>

          <RoleRestrictedRoute
            allowedRoles={[Role.Organizer, Role.Admin]}
            path={EVENTS_EDIT_PATH}
            exact
            strict
          >
            <EventsEditPage />
          </RoleRestrictedRoute>

          <RoleRestrictedRoute
            allowedRoles={[Role.Organizer, Role.Admin]}
            path={EVENTS_QR_CODE_PATH}
            exact
            strict
          >
            <EventsQrCodePage />
          </RoleRestrictedRoute>

          <RoleRestrictedRoute
            allowedRoles={[Role.Admin]}
            path={ADMIN_BOOKINGS_PATH}
            exact
            strict
          >
            <AdminBookingsPage />
          </RoleRestrictedRoute>

          <RoleRestrictedRoute
            allowedRoles={[Role.Admin]}
            path={ADMIN_VENUES_PATH}
            exact
            strict
          >
            <AdminVenuesPage />
          </RoleRestrictedRoute>

          <RoleRestrictedRoute
            allowedRoles={[Role.Admin]}
            path={ADMIN_VENUES_CREATION_PATH}
            exact
            strict
          >
            <AdminVenuesCreationPage />
          </RoleRestrictedRoute>

          <RoleRestrictedRoute
            allowedRoles={[Role.Admin]}
            path={ADMIN_VENUES_EDIT_PATH}
            exact
            strict
          >
            <AdminVenuesEditPage />
          </RoleRestrictedRoute>

          <RoleRestrictedRoute
            allowedRoles={[Role.Admin]}
            path={[ADMIN_USERS_PATH, ADMIN_USERS_PENDING_REGISTRATION_PATH]}
            exact
            strict
          >
            <AdminUsersPage />
          </RoleRestrictedRoute>

          <RoleRestrictedRoute
            allowedRoles={[Role.Admin]}
            path={ADMIN_USERS_CREATION_PATH}
            exact
            strict
          >
            <AdminUsersCreationPage />
          </RoleRestrictedRoute>

          <RoleRestrictedRoute
            allowedRoles={[Role.Admin]}
            path={ADMIN_SETTINGS_PATH}
            exact
            strict
          >
            <AdminSettingsPage />
          </RoleRestrictedRoute>

          <Redirect to={HOME_PATH} />
        </Switch>
      </LastLocationProvider>
    </Router>
  );
}

export default Routes;
