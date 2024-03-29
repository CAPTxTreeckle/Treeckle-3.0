import { UserInviteData } from "../../types/users";
import styles from "./user-email-renderer.module.scss";

type Props<T> = {
  cellData?: T;
  rowData: T;
};

function UserEmailRenderer<T extends UserInviteData>({
  cellData,
  rowData,
}: Props<T>) {
  const { email } = cellData ?? rowData;

  return (
    <a
      className={styles.userEmailRenderer}
      rel="noopener noreferrer"
      href={`mailto:${email}`}
      onClick={(e) => e.stopPropagation()}
    >
      {email}
    </a>
  );
}

export default UserEmailRenderer;
