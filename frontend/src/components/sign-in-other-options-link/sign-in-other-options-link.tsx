import { useContext } from "react";
import { Label } from "semantic-ui-react";
import { SignInContext } from "../../contexts/sign-in-provider";
import styles from "./sign-in-other-options-link.module.scss";

function SignInOtherOptionsLink() {
  const { setPasswordSignIn, setLoginDetails } = useContext(SignInContext);

  return (
    <Label
      as="a"
      className={styles.signInOtherOptionsLink}
      basic
      onClick={() => {
        setPasswordSignIn(false);
        setLoginDetails(undefined);
      }}
    >
      Use other sign-in options
    </Label>
  );
}

export default SignInOtherOptionsLink;
