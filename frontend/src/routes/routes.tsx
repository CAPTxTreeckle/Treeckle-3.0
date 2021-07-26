import {
  BrowserRouter as Router,
  Route,
  Switch,
  Redirect,
} from "react-router-dom";
import { LastLocationProvider } from "react-router-last-location";
import { Role } from "../types/users";
import { useAppSelector } from "../redux/hooks";
import { selectIsLoggedIn } from "../redux/slices/current-user-slice";
import RoleRestrictedRoute from "./role-restricted-route";
import ScrollToTopManager from "../managers/scroll-to-top-manager";
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
  // AUTH_CALLBACK_PATH,
  OUR_STORY_PATH,
  PRIVACY_POLICY_PATH,
  TERMS_AND_CONDITIONS_PATH,
} from "./paths";
import AppLayoutContainer from "../components/app-layout-container";
import DashboardPage from "../pages/dashboard-page";
import EventsPage from "../pages/events-page";
import BookingsPage from "../pages/bookings-page";
import AdminBookingsPage from "../pages/admin-bookings-page";
import AdminUsersPage from "../pages/admin-users-page";
import AdminSettingsPage from "../pages/admin-settings-page";
import ProfilePage from "../pages/profile-page";
import HomePage from "../pages/home-page";
import AdminVenuesPage from "../pages/admin-venues-page";
import AdminVenuesCreationPage from "../pages/admin-venues-creation-page";
import AdminVenuesEditPage from "../pages/admin-venues-edit-page";
import EventsCreationPage from "../pages/events-creation-page";
import EventsSingleViewPage from "../pages/events-single-view-page";
import EventsEditPage from "../pages/events-edit-page";
import EventsQrCodePage from "../pages/events-qr-code-page";
import AdminUsersCreationPage from "../pages/admin-users-creation-page";
import BookingsCreationPage from "../pages/bookings-creation-page";
// import AuthCallbackPage from "../pages/auth-callback-page";
import OurStoryPage from "../pages/our-story-page";
import PrivacyPolicyPage from "../pages/privacy-policy-page";
import TermsAndConditionsPage from "../pages/terms-and-conditions-page";

const onVisitScrollToTopPaths = [
  HOME_PATH,
  OUR_STORY_PATH,
  PRIVACY_POLICY_PATH,
  TERMS_AND_CONDITIONS_PATH,
];

function Routes() {
  const isLoggedIn = useAppSelector(selectIsLoggedIn);

  return (
    <Router>
      <LastLocationProvider>
        <AppLayoutContainer>
          <ScrollToTopManager paths={onVisitScrollToTopPaths} />
          <Switch>
            <Route path={HOME_PATH} exact>
              {isLoggedIn ? <Redirect to={DASHBOARD_PATH} /> : <HomePage />}
            </Route>

            {/* {!isLoggedIn && (
              <Route path={AUTH_CALLBACK_PATH}>
                <AuthCallbackPage />
              </Route>
            )} */}

            <Route path={OUR_STORY_PATH} exact>
              <OurStoryPage />
            </Route>

            <Route path={PRIVACY_POLICY_PATH} exact>
              <PrivacyPolicyPage />
            </Route>

            <Route path={TERMS_AND_CONDITIONS_PATH}>
              <TermsAndConditionsPage />
            </Route>

            {!isLoggedIn && <Redirect to={HOME_PATH} />}

            {/* Authenticated routes  */}

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
        </AppLayoutContainer>
      </LastLocationProvider>
    </Router>
  );
}

export default Routes;
