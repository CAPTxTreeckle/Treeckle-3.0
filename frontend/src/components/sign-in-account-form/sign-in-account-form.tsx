import { yupResolver } from "@hookform/resolvers/yup";
import { useContext } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { Button, Form } from "semantic-ui-react";
import * as yup from "yup";

import { EMAIL, NAME, PASSWORD } from "../../constants";
import { SignInContext } from "../../contexts/sign-in-provider";
import { usePasswordLogin } from "../../custom-hooks/api/auth-api";
import { useAppDispatch } from "../../redux/hooks";
import { updateCurrentUserAction } from "../../redux/slices/current-user-slice";
import { PasswordLoginPostData } from "../../types/auth";
import { ApiResponseError, resolveApiError } from "../../utils/error-utils";
import { deepTrim } from "../../utils/transform-utils";
import FormField from "../form-field";

const SCHEMA = yup.object().shape({
  [EMAIL]: yup
    .string()
    .trim()
    .email("An error has occurred")
    .required("An error has occurred"),
  [NAME]: yup.string().trim().required("Please enter your name"),
  [PASSWORD]: yup.string().trim().required("Please enter password"),
});

type SignInAccountFormProps = PasswordLoginPostData;

function SignInAccountForm() {
  const dispatch = useAppDispatch();
  const { loginDetails, setLoginDetails } = useContext(SignInContext);
  const { loading, passwordLogin } = usePasswordLogin();
  const { email = "", name = "" } = loginDetails ?? {};

  const methods = useForm<SignInAccountFormProps>({
    resolver: yupResolver(SCHEMA),
    defaultValues: { email, name, password: "" },
  });

  const { handleSubmit } = methods;

  const onSubmit = async (formData: SignInAccountFormProps) => {
    if (loading) {
      return;
    }

    try {
      const authData = await passwordLogin(deepTrim(formData));

      toast.success("Signed in successfully.");

      dispatch(updateCurrentUserAction(authData));
    } catch (error) {
      resolveApiError(error as ApiResponseError);
    }
  };

  return (
    <FormProvider {...methods}>
      <Button
        size="tiny"
        color="blue"
        basic
        content={email}
        circular
        onClick={() => setLoginDetails(undefined)}
      />

      <Form
        className="full-width"
        onSubmit={() => {
          handleSubmit(onSubmit)().catch((error) => console.error(error));
        }}
      >
        {!name && <FormField name={NAME} label="Name" required autoFocus />}

        <FormField
          name={PASSWORD}
          type="password"
          label="Password"
          required
          autoFocus={Boolean(name)}
        />

        <Form.Button
          type="submit"
          content={name ? "Sign In" : "Sign Up"}
          color="blue"
          fluid
          disabled={loading}
          loading={loading}
        />
      </Form>
    </FormProvider>
  );
}

export default SignInAccountForm;
