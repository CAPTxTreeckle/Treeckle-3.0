import classNames from "classnames";
import { Form, FormFieldProps, Label } from "semantic-ui-react";
import get from "lodash.get";
import { useFormContext } from "react-hook-form";
import styles from "./form-field.module.scss";

type Props = {
  className?: string;
  required?: boolean;
  label?: string;
  inputName: string;
  type?: string;
  errorMsg?: string;
  placeholder?: string;
  defaultValue?: string;
  readOnly?: boolean;
  hidden?: boolean;
  width?: FormFieldProps["width"];
};

function FormField({
  className,
  required = false,
  label,
  errorMsg,
  inputName,
  type = "text",
  placeholder,
  defaultValue,
  readOnly = false,
  hidden = false,
  width,
}: Props) {
  const {
    formState: { errors },
    register,
  } = useFormContext();
  const error = get(errors, inputName);

  return (
    <Form.Field
      className={classNames(hidden && styles.hidden, className)}
      required={required}
      error={Boolean(error)}
      width={width}
    >
      {label && <label>{label}</label>}
      {error && (
        <Label
          basic
          color="red"
          content={errorMsg ?? error?.message}
          pointing="below"
        />
      )}
      <input
        placeholder={placeholder}
        type={type}
        {...register(inputName, { required })}
        defaultValue={defaultValue}
        readOnly={readOnly}
      />
    </Form.Field>
  );
}

export default FormField;
