import clsx from "clsx";
import { Form, FormFieldProps, Ref } from "semantic-ui-react";
import get from "lodash/get";
import { useController, useFormContext } from "react-hook-form";

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
  } = useFormContext();
  const error = get(errors, inputName);

  const {
    field: { onChange, onBlur, value, ref },
  } = useController({
    name: inputName,
    defaultValue,
    rules: { required },
  });

  return (
    <Ref innerRef={ref}>
      <Form.Input
        className={clsx(hidden && "hidden-display", className)}
        required={required}
        error={
          error && {
            basic: true,
            color: "red",
            content: errorMsg ?? error?.message,
            pointing: "below",
          }
        }
        label={label}
        type={type}
        placeholder={placeholder}
        onChange={onChange}
        onBlur={onBlur}
        value={value}
        readOnly={readOnly}
        width={width}
      />
    </Ref>
  );
}

export default FormField;
