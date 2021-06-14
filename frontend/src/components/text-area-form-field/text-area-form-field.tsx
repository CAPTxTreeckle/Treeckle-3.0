import get from "lodash/get";
import { useFormContext } from "react-hook-form";
import { Form, Label, StrictFormFieldProps } from "semantic-ui-react";

type Props = {
  className?: string;
  required?: boolean;
  label?: string;
  inputName: string;
  errorMsg?: string;
  placeholder?: string;
  defaultValue?: string;
  readOnly?: boolean;
  rows?: number;
  hidden?: boolean;
  width?: StrictFormFieldProps["width"];
};

function TextAreaFormField({
  className,
  required = false,
  label,
  inputName,
  errorMsg,
  placeholder,
  defaultValue,
  readOnly = false,
  rows,
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
      className={className}
      required={required}
      error={!!error}
      style={hidden ? { display: "none" } : undefined}
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
      <textarea
        placeholder={placeholder}
        {...register(inputName, { required })}
        defaultValue={defaultValue}
        readOnly={readOnly}
        rows={rows}
      />
    </Form.Field>
  );
}

export default TextAreaFormField;
