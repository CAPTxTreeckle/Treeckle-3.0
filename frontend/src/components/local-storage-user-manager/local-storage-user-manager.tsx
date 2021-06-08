import { useEffect } from "react";
import { useAppSelector } from "../../redux/hooks";
import { getCurrentUser } from "../../redux/slices/current-user-slice";
import { saveToLocalStorage } from "../../utils/local-storage-utils";

function LocalStorageUserManager() {
  const currentUser = useAppSelector(getCurrentUser);

  useEffect(() => {
    saveToLocalStorage("user", currentUser);
  }, [currentUser]);

  return null;
}

export default LocalStorageUserManager;
