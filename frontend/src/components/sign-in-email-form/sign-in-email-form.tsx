import { yupResolver } from "@hookform/resolvers/yup";
import { useContext } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { Form } from "semantic-ui-react";
import * as yup from "yup";

import { EMAIL } from "../../constants";
import { SignInContext } from "../../contexts/sign-in-provider";
import { useCheckAccount } from "../../custom-hooks/api/auth-api";
import { CheckAccountPostData } from "../../types/auth";
import { resolveApiError } from "../../utils/error-utils";
import { deepTrim } from "../../utils/parser-utils";
import FormField from "../form-field";

const SCHEMA = yup.object().shape({
  [EMAIL]: yup
    .string()
    .trim()
    .email("Input must be a valid email")
    .required("Please enter an email"),
});

type SignInEmailFormProps = CheckAccountPostData;

function SignInEmailForm() {
  const { inputEmail, setLoginDetails, setInputEmail } =
    useContext(SignInContext);
  const { loading, checkAccount } = useCheckAccount();
  const methods = useForm<SignInEmailFormProps>({
    resolver: yupResolver(SCHEMA),
    defaultValues: { email: inputEmail },
  });

  const { handleSubmit } = methods;

  const onSubmit = async (formData: SignInEmailFormProps) => {
    if (loading) {
      return;
    }

    try {
      const loginDetails = await checkAccount(deepTrim(formData));
      setLoginDetails(loginDetails);
      setInputEmail(loginDetails.email);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      resolveApiError(error);
    }
  };

  return (
    <FormProvider {...methods}>
      <Form className="full-width" onSubmit={handleSubmit(onSubmit)}>
        <FormField name={EMAIL} type="email" label="Email" required autoFocus />

        <Form.Button
          type="submit"
          content="Next"
          color="blue"
          fluid
          disabled={loading}
          loading={loading}
        />
      </Form>
    </FormProvider>
  );
}

export default SignInEmailForm;
