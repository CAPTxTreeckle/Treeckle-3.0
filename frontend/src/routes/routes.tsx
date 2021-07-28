import { Suspense, lazy } from "react";
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
  // EVENTS_PATH,
  // EVENTS_SIGNED_UP_PATH,
  // EVENTS_SUBSCRIPTIONS_PATH,
  // EVENTS_OWN_PATH,
  // EVENTS_CREATION_PATH,
  // EVENTS_SINGLE_VIEW_PATH,
  // EVENTS_EDIT_PATH,
  // EVENTS_QR_CODE_PATH,
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
  TERMS_OF_USE_PATH,
} from "./paths";
import AppLayoutContainer from "../components/app-layout-container";

// Code splitting
const DashboardPage = lazy(() => import("../pages/dashboard-page"));
// const EventsPage = lazy(() => import("../pages/events-page"));
const BookingsPage = lazy(() => import("../pages/bookings-page"));
const AdminBookingsPage = lazy(() => import("../pages/admin-bookings-page"));
const AdminUsersPage = lazy(() => import("../pages/admin-users-page"));
const AdminSettingsPage = lazy(() => import("../pages/admin-settings-page"));
const ProfilePage = lazy(() => import("../pages/profile-page"));
const HomePage = lazy(() => import("../pages/home-page"));
const AdminVenuesPage = lazy(() => import("../pages/admin-venues-page"));
const AdminVenuesCreationPage = lazy(
  () => import("../pages/admin-venues-creation-page"),
);
const AdminVenuesEditPage = lazy(
  () => import("../pages/admin-venues-edit-page"),
);
// const EventsCreationPage = lazy(() => import("../pages/events-creation-page"));
// const EventsSingleViewPage = lazy(() => import("../pages/events-single-view-page"));
// const EventsEditPage = lazy(() => import("../pages/events-edit-page"));
// const EventsQrCodePage = lazy(() => import("../pages/events-qr-code-page"));
const AdminUsersCreationPage = lazy(
  () => import("../pages/admin-users-creation-page"),
);
const BookingsCreationPage = lazy(
  () => import("../pages/bookings-creation-page"),
);
// import AuthCallbackPage from "../pages/auth-callback-page";
const OurStoryPage = lazy(() => import("../pages/our-story-page"));
const PrivacyPolicyPage = lazy(() => import("../pages/privacy-policy-page"));
const TermsOfUsePage = lazy(() => import("../pages/terms-of-use-page"));

const ON_VISIT_SCROLL_TO_TOP_PATHS = [
  HOME_PATH,
  OUR_STORY_PATH,
  PRIVACY_POLICY_PATH,
  TERMS_OF_USE_PATH,
];

function Routes() {
  const isLoggedIn = useAppSelector(selectIsLoggedIn);

  return (
    <Router>
      <LastLocationProvider>
        <AppLayoutContainer>
          <ScrollToTopManager paths={ON_VISIT_SCROLL_TO_TOP_PATHS} />
          {/* use null since the loading is fast and a loader would flicker momentarily */}
          {/* require background to be same color as theme color */}
          <Suspense fallback={null}>
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

              <Route path={TERMS_OF_USE_PATH}>
                <TermsOfUsePage />
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

              {/* <Route
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
            </RoleRestrictedRoute> */}

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
          </Suspense>
        </AppLayoutContainer>
      </LastLocationProvider>
    </Router>
  );
}

export default Routes;
