import { ReactNode } from "react";
import { useAppSelector } from "../../redux/hooks";
import { getIsLoggedIn } from "../../redux/slices/current-user-slice";
import NavigationContainer from "../navigation-container";

type Props = {
  children: ReactNode;
};

function AppLayoutContainer({ children }: Props) {
  const isLoggedIn = useAppSelector(getIsLoggedIn);

  return (
    <>
      {isLoggedIn ? (
        <NavigationContainer>{children}</NavigationContainer>
      ) : (
        children
      )}
    </>
  );
}

export default AppLayoutContainer;
