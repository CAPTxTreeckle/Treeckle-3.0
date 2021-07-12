import { useContext } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Form, Label } from "semantic-ui-react";
import FormField from "../form-field";
import { SignInContext } from "../../contexts/sign-in-provider";
import { NAME, EMAIL, PASSWORD } from "../../constants";
import { PasswordLoginPostData } from "../../types/auth";
import { usePasswordLogin } from "../../custom-hooks/api/auth-api";
import { deepTrim } from "../../utils/parser-utils";

const schema = yup.object().shape({
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
  const { loginDetails, setLoginDetails } = useContext(SignInContext);
  const { loading, passwordLogin } = usePasswordLogin();
  const { email = "", name = "" } = loginDetails ?? {};

  const methods = useForm<SignInAccountFormProps>({
    resolver: yupResolver(schema),
    defaultValues: { email, name, password: "" },
  });

  const { handleSubmit } = methods;

  const onSubmit = async (formData: SignInAccountFormProps) =>
    passwordLogin(deepTrim(formData));

  return (
    <FormProvider {...methods}>
      <Label
        as="a"
        color="blue"
        basic
        content={email}
        circular
        onClick={() => setLoginDetails(undefined)}
      />

      <Form className="full-width" onSubmit={handleSubmit(onSubmit)}>
        {!name && <FormField inputName={NAME} label="Name" required />}

        <FormField
          inputName={PASSWORD}
          type="password"
          label="Password"
          required
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
