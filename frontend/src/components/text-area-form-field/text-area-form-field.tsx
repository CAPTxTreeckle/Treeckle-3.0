import clsx from "clsx";
import get from "lodash/get";
import { useController, useFormContext } from "react-hook-form";
import { Form, FormFieldProps, Ref } from "semantic-ui-react";

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
  width?: FormFieldProps["width"];
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
      <Form.TextArea
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
        placeholder={placeholder}
        onChange={onChange}
        onBlur={onBlur}
        value={value}
        readOnly={readOnly}
        rows={rows}
        width={width}
      />
    </Ref>
  );
}

export default TextAreaFormField;
