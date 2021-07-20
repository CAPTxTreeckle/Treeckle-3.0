import { ReactNode, SyntheticEvent } from "react";
import { useController } from "react-hook-form";
import {
  DropdownItemProps,
  DropdownProps,
  Form,
  Ref,
  SemanticWIDTHS,
} from "semantic-ui-react";
import useOptionsState from "../../custom-hooks/use-options-state";
import { sanitizeArray } from "../../utils/parser-utils";
import { DEFAULT_ARRAY } from "../../constants";

type Props = {
  className?: string;
  required?: boolean;
  label?: ReactNode;
  name: string;
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
  width?: SemanticWIDTHS;
  fluid?: boolean;
};

function DropdownSelectorFormField({
  className,
  required = false,
  label,
  name,
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
  width,
  fluid = false,
}: Props) {
  const { options, onSelect } = useOptionsState(defaultOptions);

  const {
    field: { onChange, onBlur, value, ref },
    fieldState: { error },
  } = useController({
    name,
    defaultValue,
    rules: { required },
  });

  const onSelectChange = (
    event: SyntheticEvent<HTMLElement, Event>,
    data: DropdownProps,
  ) => {
    const { value: newValue } = data;
    const trimmedValue = sanitizeArray(
      Array.isArray(newValue) ? (newValue as string[]) : [newValue as string],
    );

    if (multiple) {
      if (JSON.stringify(trimmedValue) === JSON.stringify(value)) {
        return;
      }
      onChange(trimmedValue);
    } else {
      if (
        (!clearable && trimmedValue.length === 0) ||
        trimmedValue?.[0] === value
      ) {
        return;
      }
      onChange(trimmedValue?.[0] ?? "");
    }

    onSelect(trimmedValue);
    onChangeEffect?.(event, data);
  };

  return (
    <Ref
      innerRef={(element) =>
        ref(
          Array.from(
            Array.from(element?.children ?? []).find((child) =>
              child.className.includes("dropdown"),
            )?.children ?? [],
          ).find((child) => child.tagName === "INPUT"),
        )
      }
    >
      <Form.Select
        className={className}
        fluid={fluid}
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
        width={width}
        onChange={onSelectChange}
        value={value}
        error={
          error &&
          (errorMsg || error?.message
            ? {
                content: errorMsg ?? error?.message,
                pointing: "below",
              }
            : true)
        }
      />
    </Ref>
  );
}

export default DropdownSelectorFormField;
