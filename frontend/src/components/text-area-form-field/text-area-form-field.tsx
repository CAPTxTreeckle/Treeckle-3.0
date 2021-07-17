import { ReactNode, Ref } from "react";
import clsx from "clsx";
import get from "lodash/get";
import { useFormContext } from "react-hook-form";
import { Form, FormTextAreaProps } from "semantic-ui-react";
import TextareaAutosize from "react-textarea-autosize";

const Textarea = ({
  innerRef,
  ...textareaAutosizeProps
}: Parameters<typeof TextareaAutosize>["0"] & {
  innerRef?: Ref<HTMLTextAreaElement>;
}) => <TextareaAutosize {...textareaAutosizeProps} ref={innerRef} />;

type Props = {
  className?: string;
  required?: boolean;
  label?: ReactNode;
  fieldName: string;
  errorMsg?: string;
  placeholder?: string;
  defaultValue?: string;
  readOnly?: boolean;
  minRows?: number;
  maxRows?: number;
  hidden?: boolean;
  width?: FormTextAreaProps["width"];
  autoFocus?: boolean;
};

function TextAreaFormField({
  className,
  required = false,
  label,
  fieldName,
  errorMsg,
  placeholder,
  defaultValue,
  readOnly = false,
  minRows = 5,
  maxRows,
  hidden = false,
  width,
  autoFocus = false,
}: Props) {
  const {
    formState: { errors },
    register,
  } = useFormContext();
  const error = get(errors, fieldName);

  const { ref, ...otherRegisterProps } = register(fieldName, {
    required,
    value: defaultValue,
  });

  return (
    <Form.Field
      className={clsx(hidden && "hidden-display", className)}
      control={Textarea}
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
      hidden={hidden}
      autoFocus={autoFocus}
      innerRef={ref}
      {...otherRegisterProps}
    />
  );
}

export default TextAreaFormField;
