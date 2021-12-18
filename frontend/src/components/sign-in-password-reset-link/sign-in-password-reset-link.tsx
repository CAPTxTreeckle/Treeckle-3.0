import { useContext } from "react";
import { toast } from "react-toastify";
import { Icon, Label } from "semantic-ui-react";

import { SignInContext } from "../../contexts/sign-in-provider";
import { usePasswordReset } from "../../custom-hooks/api/auth-api";
import { resolveApiError } from "../../utils/error-utils";
import styles from "./sign-in-password-reset-link.module.scss";

function SignInPasswordResetLink() {
  const { loginDetails: { email } = { email: "" } } = useContext(SignInContext);
  const { loading, passwordReset } = usePasswordReset();

  const onPasswordReset = async () => {
    if (loading) {
      return;
    }

    try {
      await passwordReset({ email });

      toast.info("An email has been sent to reset your password.");

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      resolveApiError(error);
    }
  };

  return loading ? (
    <Icon name="spinner" loading fitted />
  ) : (
    <Label
      as="a"
      className={styles.signInPasswordResetLink}
      basic
      onClick={onPasswordReset}
    >
      Reset password
    </Label>
  );
}

export default SignInPasswordResetLink;
