import { USER_ID } from "../../constants";
import { PROFILE_PATH } from "../../routes/paths";
import { UserData } from "../../types/users";
import styles from "./user-name-renderer.module.scss";

type Props<T> = {
  cellData?: T;
  rowData: T;
};

function UserNameRenderer<T extends UserData>({ cellData, rowData }: Props<T>) {
  const { name, id } = cellData ?? rowData;

  return (
    <a
      className={styles.userNameRenderer}
      href={PROFILE_PATH.replace(`:${USER_ID}`, `${id}`)}
      target="_blank"
      rel="noopener noreferrer"
      onClick={(e) => e.stopPropagation()}
    >
      {name}
    </a>
  );
}

export default UserNameRenderer;
