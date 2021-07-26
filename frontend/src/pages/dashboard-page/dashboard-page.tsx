import { useAppSelector } from "../../redux/hooks";
import { selectCurrentUserDisplayInfo } from "../../redux/slices/current-user-slice";
import LinkifyTextViewer from "../../components/linkify-text-viewer";
import styles from "./dashboard-page.module.scss";

function DashboardPage() {
  const { name } = useAppSelector(selectCurrentUserDisplayInfo) ?? {};

  return (
    <div className={styles.dashboardPage}>
      <LinkifyTextViewer>
        <h2>Welcome, {name}!</h2>
        <h3>
          Head over to the &quot;Bookings&quot; tab to view/make bookings.
        </h3>

        {/* <h3>Visit the "Events" tab to see upcoming events!</h3> */}

        <p>
          <strong>Note:</strong> Treeckle is currently in development and we are
          working hard towards making residential life better for you. For
          urgent queries or if you have found any bugs, please contact us at
          treeckle@googlegroups.com.
        </p>
        <br />
        <iframe
          title="NUSMods"
          className={styles.timetable}
          src="https://nusmods.com"
        />
      </LinkifyTextViewer>
    </div>
  );
}

export default DashboardPage;
