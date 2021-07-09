import { useEffect } from "react";
import { useAppSelector } from "../../redux/hooks";
import { selectCurrentUser } from "../../redux/slices/current-user-slice";
import { saveToLocalStorage } from "../../utils/local-storage-utils";

function LocalStorageUserManager() {
  const currentUser = useAppSelector(selectCurrentUser);

  useEffect(() => {
    saveToLocalStorage("user", currentUser);
  }, [currentUser]);

  return null;
}

export default LocalStorageUserManager;
