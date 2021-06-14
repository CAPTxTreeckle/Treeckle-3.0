import { SyntheticEvent } from "react";
import { useFormContext, useController } from "react-hook-form";
import clsx from "clsx";
import { DropdownItemProps, DropdownProps, Form, Ref } from "semantic-ui-react";
import get from "lodash/get";
import useOptionsState from "../../custom-hooks/use-options-state";
import { sanitizeArray } from "../../utils/parser-utils";
import { DEFAULT_ARRAY } from "../../constants";

type Props = {
  className?: string;
  required?: boolean;
  label?: string;
  inputName: string;
  errorMsg?: string;
  placeholder?: string;
  defaultValue?: string | string[];
  defaultOptions?: string[] | DropdownItemProps[];
  loading?: boolean;
  multiple?: boolean;
  allowAdditions?: boolean;
  search?: boolean;
  clearable?: boolean;
  onChangeEffect?: (
    e: SyntheticEvent<HTMLElement, Event>,
    data: DropdownProps,
  ) => void;
  hidden?: boolean;
};

function DropdownSelectorFormField({
  className,
  required = false,
  label,
  inputName,
  errorMsg,
  placeholder,
  defaultValue,
  defaultOptions = DEFAULT_ARRAY,
  loading = false,
  multiple = false,
  allowAdditions = false,
  search = false,
  clearable = false,
  onChangeEffect,
  hidden = false,
}: Props) {
  const { options, onSelect } = useOptionsState(defaultOptions);
  const {
    formState: { errors },
    getValues,
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
      <Form.Select
        className={clsx(hidden && "hidden-display", className)}
        loading={loading}
        placeholder={placeholder}
        label={label}
        required={required}
        options={options}
        search={search}
        allowAdditions={allowAdditions}
        onBlur={onBlur}
        multiple={multiple}
        clearable={clearable}
        onChange={(event, data) => {
          const { value } = data;
          const trimmedValue = sanitizeArray(
            Array.isArray(value) ? (value as string[]) : [value as string],
          );

          if (multiple) {
            if (
              JSON.stringify(trimmedValue) ===
              JSON.stringify(getValues(inputName))
            ) {
              return;
            }
            onChange(trimmedValue);
          } else {
            if (
              (!clearable && trimmedValue.length === 0) ||
              trimmedValue?.[0] === getValues(inputName)
            ) {
              return;
            }
            onChange(trimmedValue?.[0] ?? "");
          }

          onSelect(trimmedValue);
          onChangeEffect?.(event, data);
        }}
        value={value}
        error={
          error && {
            basic: true,
            color: "red",
            content: errorMsg ?? error?.message,
            pointing: "below",
          }
        }
      />
    </Ref>
  );
}

export default DropdownSelectorFormField;
