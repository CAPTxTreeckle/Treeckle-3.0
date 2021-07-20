import { ReactNode, memo } from "react";
import get from "lodash/get";
import pickBy from "lodash/pickBy";
import { useFormContext } from "react-hook-form";
import { Form, SemanticWIDTHS } from "semantic-ui-react";
import TextArea from "../text-area";

type Props = {
  className?: string;
  required?: boolean;
  label?: ReactNode;
  name: string;
  errorMsg?: string;
  placeholder?: string;
  defaultValue?: string;
  readOnly?: boolean;
  minRows?: number;
  maxRows?: number;
  width?: SemanticWIDTHS;
  autoFocus?: boolean;
};

function TextAreaFormField({
  className,
  required = false,
  label,
  name,
  errorMsg,
  placeholder,
  defaultValue,
  readOnly = false,
  minRows = 3,
  maxRows = 10,
  width,
  autoFocus = false,
}: Props) {
  const {
    formState: { errors },
    register,
  } = useFormContext();
  const error = get(errors, name);

  const { ref, ...otherRegisterProps } = register(
    name,
    pickBy({ required, value: defaultValue }, (key) => key !== undefined),
  );

  return (
    <Form.Field
      className={className}
      control={TextArea}
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
      placeholder={placeholder}
      readOnly={readOnly}
      width={width}
      rows={minRows}
      minRows={minRows}
      maxRows={maxRows}
      autoFocus={autoFocus}
      innerRef={ref}
      {...otherRegisterProps}
    />
  );
}

export default memo(TextAreaFormField);
