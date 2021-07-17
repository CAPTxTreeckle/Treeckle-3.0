import { FormEvent, ReactNode } from "react";
import clsx from "clsx";
import { useController } from "react-hook-form";
import { CheckboxProps, Form, Ref } from "semantic-ui-react";

type Props = {
  className?: string;
  label?: ReactNode;
  fieldName: string;
  type: "slider" | "toggle" | "checkbox";
  defaultValue?: boolean;
  readOnly?: boolean;
  onChangeEffect?: (
    e: FormEvent<HTMLInputElement>,
    data: CheckboxProps,
  ) => void;
  hidden?: boolean;
};

function RadioFormField({
  className,
  label,
  fieldName,
  type,
  defaultValue,
  readOnly = false,
  onChangeEffect,
  hidden = false,
}: Props) {
  const {
    field: { onChange, onBlur, value, ref },
  } = useController({ name: fieldName, defaultValue });

  return (
    <Ref innerRef={ref}>
      <Form.Checkbox
        className={clsx(hidden && "hidden-display", className)}
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
      />
    </Ref>
  );
}

export default RadioFormField;
