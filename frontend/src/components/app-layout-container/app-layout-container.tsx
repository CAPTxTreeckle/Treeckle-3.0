import { ReactNode } from "react";
import { useAppSelector } from "../../redux/hooks";
import { selectIsLoggedIn } from "../../redux/slices/current-user-slice";
import NavigationContainer from "../navigation-container";

type Props = {
  children: ReactNode;
};

function AppLayoutContainer({ children }: Props) {
  const isLoggedIn = useAppSelector(selectIsLoggedIn);

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
