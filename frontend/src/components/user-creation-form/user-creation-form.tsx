import { yupResolver } from "@hookform/resolvers/yup";
import { capitalCase } from "change-case";
import { FormProvider, useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { Form } from "semantic-ui-react";
import * as yup from "yup";
import { ROLE, EMAILS } from "../../constants";
import { Role, userRoles } from "../../types/users";
import DropdownSelectorFormField from "../dropdown-selector-form-field";
import TextAreaFormField from "../text-area-form-field";

type UserCreationFormProps = {
  [ROLE]: Role.Resident;
  [EMAILS]: string;
};

const schema = yup.object().shape({
  [ROLE]: yup.mixed<Role>().oneOf(userRoles).required("Please choose a role"),
  [EMAILS]: yup.string().trim().required("Please enter at least 1 email"),
});

const defaultValues: UserCreationFormProps = {
  [ROLE]: Role.Resident,
  [EMAILS]: "",
};

const roles = userRoles.map((role) => ({
  value: role,
  text: capitalCase(role),
}));

function UserCreationForm() {
  const methods = useForm<UserCreationFormProps>({
    resolver: yupResolver(schema),
    defaultValues,
  });

  const { handleSubmit, reset } = methods;

  const onSubmit = (formData: UserCreationFormProps) => {
    const { role } = formData;
    reset({ emails: "", role });
    toast.info("The input has been successfully parsed.");
  };

  return (
    <>
      <h2>Manual Input</h2>
      <FormProvider {...methods}>
        <Form onSubmit={handleSubmit(onSubmit)}>
          <DropdownSelectorFormField
            inputName={ROLE}
            label="Role"
            required
            defaultOptions={roles}
          />

          <TextAreaFormField
            inputName={EMAILS}
            label="Emails"
            required
            rows={8}
          />

          <Form.Button fluid type="submit" content="Parse Input" color="blue" />
        </Form>
      </FormProvider>
    </>
  );
}

export default UserCreationForm;
