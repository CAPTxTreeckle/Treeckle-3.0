import { ReactNode, Ref, memo } from "react";
import get from "lodash/get";
import pickBy from "lodash/pickBy";
import { useFormContext } from "react-hook-form";
import { Form, FormTextAreaProps } from "semantic-ui-react";
import TextareaAutosize from "react-textarea-autosize";

const TextArea = ({
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
  maxRows = minRows,
  width,
  autoFocus = false,
}: Props) {
  const {
    formState: { errors },
    register,
  } = useFormContext();
  const error = get(errors, fieldName);

  const { ref, ...otherRegisterProps } = register(
    fieldName,
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
      maxRows={Math.max(maxRows, minRows)}
      autoFocus={autoFocus}
      innerRef={ref}
      {...otherRegisterProps}
    />
  );
}

export default memo(TextAreaFormField);
