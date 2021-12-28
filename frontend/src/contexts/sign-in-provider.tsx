import {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useMemo,
  useState,
} from "react";

import { LoginDetails } from "../types/auth";

type SignInContextType = {
  isPasswordSignIn: boolean;
  setPasswordSignIn: Dispatch<SetStateAction<boolean>>;
  inputEmail: string;
  setInputEmail: Dispatch<SetStateAction<string>>;
  loginDetails?: LoginDetails;
  setLoginDetails: Dispatch<SetStateAction<LoginDetails | undefined>>;
};

export const SignInContext = createContext<SignInContextType>({
  isPasswordSignIn: false,
  setPasswordSignIn: () => {
    throw new Error("setPasswordSignIn not defined.");
  },
  inputEmail: "",
  setInputEmail: () => {
    throw new Error("setInputEmail not defined.");
  },
  setLoginDetails: () => {
    throw new Error("setLoginDetails not defined.");
  },
});

type Props = {
  children: ReactNode;
};

function SignInProvider({ children }: Props) {
  const [isPasswordSignIn, setPasswordSignIn] = useState(false);
  const [inputEmail, setInputEmail] = useState("");
  const [loginDetails, setLoginDetails] = useState<LoginDetails>();

  const contextValue = useMemo(
    () => ({
      isPasswordSignIn,
      setPasswordSignIn,
      inputEmail,
      setInputEmail,
      loginDetails,
      setLoginDetails,
    }),
    [isPasswordSignIn, inputEmail, loginDetails],
  );

  return (
    <SignInContext.Provider value={contextValue}>
      {children}
    </SignInContext.Provider>
  );
}

export default SignInProvider;
