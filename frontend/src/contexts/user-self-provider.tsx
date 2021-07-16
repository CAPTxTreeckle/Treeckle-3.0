import {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useState,
} from "react";
import { SelfData } from "../types/users";

type UserSelfContextType = {
  self?: SelfData;
  setSelf: Dispatch<SetStateAction<SelfData | undefined>>;
};

export const UserSelfContext = createContext<UserSelfContextType>({
  setSelf: () => {
    throw new Error("setSelf not defined.");
  },
});

type Props = {
  children: ReactNode;
};

function UserSelfProvider({ children }: Props) {
  const [self, setSelf] = useState<SelfData>();

  return (
    <UserSelfContext.Provider value={{ self, setSelf }}>
      {children}
    </UserSelfContext.Provider>
  );
}

export default UserSelfProvider;
