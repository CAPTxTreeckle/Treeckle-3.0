import { ReactNode, useEffect, useState } from "react";
import { useMediaQuery } from "react-responsive";
import { Container, Menu, Segment, Sidebar } from "semantic-ui-react";

import { Role } from "../../types/users";
import FullPageContainer from "../full-page-container";
import PageBody from "../page-body";
// import EventsTab from "./events-tab";
import RoleRestrictedWrapper from "../role-restricted-wrapper";
import DashboardTab from "./dashboard-tab";
import DesktopAboutTab from "./desktop-about-tab";
import DesktopAdminTab from "./desktop-admin-tab";
import LogoTab from "./logo-tab";
import MobileAboutTab from "./mobile-about-tab";
import MobileAdminTab from "./mobile-admin-tab";
import styles from "./navigation-container.module.scss";
import SidebarTab from "./sidebar-tab";
import TopBar from "./top-bar";
import UserTab from "./user-tab";

type Props = {
  children: ReactNode;
};

function NavigationContainer({ children }: Props) {
  const [isSidebarOpened, setSidebarOpened] = useState(false);
  const isComputerOrLarger = useMediaQuery({ query: "(min-width: 992px)" });

  const closeSidebar = () => setSidebarOpened(false);
  const openSidebar = () => setSidebarOpened(true);

  useEffect(() => {
    if (isComputerOrLarger) {
      setSidebarOpened(false);
    }
  }, [isComputerOrLarger]);

  return (
    <Sidebar.Pushable>
      <Sidebar
        as={Menu}
        animation="push"
        onHide={closeSidebar}
        vertical
        visible={isSidebarOpened}
      >
        <LogoTab onTabClick={closeSidebar} />
        <DashboardTab onTabClick={closeSidebar} />
        {/* <EventsTab onTabClick={closeSidebar} /> */}
        <MobileAboutTab onTabClick={closeSidebar} />
        <RoleRestrictedWrapper allowedRoles={[Role.Admin]}>
          <MobileAdminTab onTabClick={closeSidebar} />
        </RoleRestrictedWrapper>
      </Sidebar>

      <Sidebar.Pusher dimmed={isSidebarOpened}>
        <FullPageContainer>
          <TopBar>
            {isComputerOrLarger ? (
              <>
                <LogoTab />
                <DashboardTab />
                {/* <EventsTab /> */}
                <DesktopAboutTab />
                <RoleRestrictedWrapper allowedRoles={[Role.Admin]}>
                  <DesktopAdminTab />
                </RoleRestrictedWrapper>
              </>
            ) : (
              <SidebarTab onTabClick={openSidebar} />
            )}

            <UserTab />
          </TopBar>

          <PageBody className={styles.pageBody}>
            <Segment padded vertical>
              <Container>{children}</Container>
            </Segment>
          </PageBody>
        </FullPageContainer>
      </Sidebar.Pusher>
    </Sidebar.Pushable>
  );
}

export default NavigationContainer;
