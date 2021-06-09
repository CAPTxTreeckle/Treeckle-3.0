import classNames from "classnames";
import { useController, useFormContext } from "react-hook-form";
import { CheckboxProps, Form, Ref } from "semantic-ui-react";
import styles from "./radio-form-field.module.scss";

type Props = {
  className?: string;
  label?: string;
  inputName: string;
  type: "slider" | "toggle" | "checkbox";
  defaultValue?: boolean;
  readOnly?: boolean;
  disabled?: boolean;
  onChangeEffect?: (
    e: React.FormEvent<HTMLInputElement>,
    data: CheckboxProps,
  ) => void;
  hidden?: boolean;
};

function RadioFormField({
  className,
  label,
  inputName,
  type,
  defaultValue,
  readOnly = false,
  disabled = false,
  onChangeEffect,
  hidden = false,
}: Props) {
  const {
    field: { onChange, onBlur, value, ref },
  } = useController({ name: inputName, defaultValue });

  return (
    <Ref innerRef={ref}>
      <Form.Checkbox
        className={classNames(hidden && styles.hidden, className)}
        onBlur={onBlur}
        label={label}
        onChange={(event, data) => {
          onChange(data.checked);
          onChangeEffect?.(event, data);
        }}
        checked={value}
        slider={type === "slider"}
        toggle={type === "toggle"}
        readOnly={readOnly}
        disabled={disabled}
      />
    </Ref>
  );
}

export default RadioFormField;
