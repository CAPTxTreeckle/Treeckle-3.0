import { useContext } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Form } from "semantic-ui-react";
import FormField from "../form-field";
import { EMAIL } from "../../constants";
import { deepTrim } from "../../utils/parser-utils";
import { SignInContext } from "../../contexts/sign-in-provider";
import { CheckAccountPostData } from "../../types/auth";
import { useCheckAccount } from "../../custom-hooks/api/auth-api";
import { resolveApiError } from "../../utils/error-utils";

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
    } catch (error) {
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
