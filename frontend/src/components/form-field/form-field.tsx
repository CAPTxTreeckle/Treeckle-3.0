import { InputHTMLAttributes, ReactNode, memo } from "react";
import get from "lodash/get";
import pickBy from "lodash/pickBy";
import { Form, SemanticWIDTHS } from "semantic-ui-react";
import { useFormContext } from "react-hook-form";

type Props = {
  className?: string;
  required?: boolean;
  label?: ReactNode;
  name: string;
  type?: InputHTMLAttributes<HTMLInputElement>["type"];
  errorMsg?: string;
  placeholder?: string;
  defaultValue?: string;
  readOnly?: boolean;
  width?: SemanticWIDTHS;
  fluid?: boolean;
  autoFocus?: boolean;
};

function FormField({
  className,
  required = false,
  label,
  errorMsg,
  name,
  type = "text",
  placeholder,
  defaultValue,
  readOnly = false,
  width,
  fluid = false,
  autoFocus,
}: Props) {
  const {
    formState: { errors },
    register,
  } = useFormContext();
  const error = get(errors, name);

  return (
    <Form.Input
      className={className}
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
        autoFocus,
        ...register(
          name,
          pickBy({ required, value: defaultValue }, (key) => key !== undefined),
        ),
      }}
    />
  );
}

export default memo(FormField);
