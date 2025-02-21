import { useContext } from "react";
import { toast } from "react-toastify";
import { Icon, Label } from "semantic-ui-react";

import { SignInContext } from "../../contexts/sign-in-provider";
import { usePasswordReset } from "../../custom-hooks/api/auth-api";
import { ApiResponseError, resolveApiError } from "../../utils/error-utils";
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
    } catch (error) {
      resolveApiError(error as ApiResponseError);
    }
  };

  return loading ? (
    <Icon name="spinner" loading fitted />
  ) : (
    <Label
      as="a"
      className={styles.signInPasswordResetLink}
      basic
      onClick={() => {
        onPasswordReset().catch((error) => console.error(error));
      }}
    >
      Reset password
    </Label>
  );
}

export default SignInPasswordResetLink;
