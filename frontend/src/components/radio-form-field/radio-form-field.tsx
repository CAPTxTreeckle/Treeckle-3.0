import { ReactNode } from "react";
import clsx from "clsx";
import { useController } from "react-hook-form";
import { Form, Ref } from "semantic-ui-react";
import styles from "./radio-form-field.module.scss";

type Props = {
  className?: string;
  required?: boolean;
  label?: ReactNode;
  errorMsg?: string;
  name: string;
  type: "slider" | "toggle" | "checkbox";
  defaultValue?: boolean;
  readOnly?: boolean;
};

function RadioFormField({
  className,
  required = false,
  label,
  errorMsg,
  name,
  type,
  defaultValue,
  readOnly = false,
}: Props) {
  const {
    field: { onChange, onBlur, value, ref },
    fieldState: { error },
  } = useController({ name, defaultValue, rules: { required } });

  return (
    <Ref
      innerRef={(element) =>
        ref(
          Array.from(element?.children ?? [])
            .find((child) => child.className.includes("checkbox"))
            ?.children.namedItem(name),
        )
      }
    >
      <Form.Checkbox
        className={clsx(styles.checkbox, className)}
        label={label}
        error={
          error &&
          (errorMsg || error?.message
            ? {
                content: errorMsg ?? error?.message,
                pointing: "below",
              }
            : true)
        }
        required={required}
        onChange={(_, { checked }) => onChange(checked)}
        onBlur={onBlur}
        checked={value}
        slider={type === "slider"}
        toggle={type === "toggle"}
        readOnly={readOnly}
        name={name}
      />
    </Ref>
  );
}

export default RadioFormField;
