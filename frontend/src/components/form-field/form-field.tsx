import { InputHTMLAttributes, ReactNode } from "react";
import clsx from "clsx";
import { Form, FormFieldProps } from "semantic-ui-react";
import get from "lodash/get";
import { useFormContext } from "react-hook-form";

type Props = {
  className?: string;
  required?: boolean;
  label?: ReactNode;
  fieldName: string;
  type?: InputHTMLAttributes<HTMLInputElement>["type"];
  errorMsg?: string;
  placeholder?: string;
  defaultValue?: string;
  readOnly?: boolean;
  hidden?: boolean;
  width?: FormFieldProps["width"];
  fluid?: boolean;
  autoFocus?: boolean;
};

function FormField({
  className,
  required = false,
  label,
  errorMsg,
  fieldName,
  type = "text",
  placeholder,
  defaultValue,
  readOnly = false,
  hidden = false,
  width,
  fluid = false,
  autoFocus,
}: Props) {
  const {
    formState: { errors },
    register,
  } = useFormContext();
  const error = get(errors, fieldName);

  return (
    <Form.Input
      className={clsx(hidden && "hidden-display", className)}
      fluid={fluid}
      required={required}
      error={
        error &&
        (errorMsg || error?.message
          ? {
              content: errorMsg ?? error?.message,
              pointing: "below",
            }
          : true)
      }
      label={label}
      width={width}
      input={{
        type,
        placeholder,
        readOnly,
        hidden,
        autoFocus,
        ...register(fieldName, { required, value: defaultValue }),
      }}
    />
  );
}

export default FormField;
