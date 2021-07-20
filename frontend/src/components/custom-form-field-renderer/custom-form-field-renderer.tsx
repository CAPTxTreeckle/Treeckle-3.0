import { FieldType, BookingFormFieldProps } from "../../types/venues";
import FormField from "../form-field";
import LinkifyTextViewer from "../linkify-text-viewer";
import RadioFormField from "../radio-form-field";
import TextAreaFormField from "../text-area-form-field";
import TextDisplayFormField from "../text-display-form-field";

type Props = BookingFormFieldProps & {
  name: string;
  readOnly?: boolean;
  defaultValue?: string | boolean;
};

function CustomFormFieldRenderer({
  name,
  label: labelString,
  type,
  placeholder,
  required,
  readOnly = false,
  defaultValue,
}: Props) {
  const label = (
    <label className="text-viewer">
      <LinkifyTextViewer>{labelString}</LinkifyTextViewer>
    </label>
  );

  switch (type) {
    case FieldType.Text:
      return (
        <FormField
          label={label}
          name={name}
          placeholder={placeholder}
          required={required}
          readOnly={readOnly}
          defaultValue={
            defaultValue === undefined ? defaultValue : String(defaultValue)
          }
        />
      );
    case FieldType.TextArea:
      return (
        <TextAreaFormField
          label={label}
          name={name}
          placeholder={placeholder}
          required={required}
          readOnly={readOnly}
          defaultValue={
            defaultValue === undefined ? defaultValue : String(defaultValue)
          }
          minRows={3}
          maxRows={readOnly ? 3 : undefined}
        />
      );
    case FieldType.Number:
      return (
        <FormField
          label={label}
          name={name}
          placeholder={placeholder}
          required={required}
          readOnly={readOnly}
          type="number"
          defaultValue={
            defaultValue === undefined ? defaultValue : String(defaultValue)
          }
        />
      );
    case FieldType.Boolean:
      return (
        <RadioFormField
          label={label}
          name={name}
          required={required}
          type="checkbox"
          readOnly={readOnly}
          defaultValue={
            defaultValue === undefined ? defaultValue : Boolean(defaultValue)
          }
        />
      );
    case FieldType.TextDisplay:
      return (
        <TextDisplayFormField
          text={labelString}
          maxRows={readOnly ? 5 : undefined}
        />
      );
    default:
      return null;
  }
}

export default CustomFormFieldRenderer;
