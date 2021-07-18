import { FieldType, BookingFormFieldProps } from "../../types/venues";
import FormField from "../form-field";
import LinkifyTextViewer from "../linkify-text-viewer";
import RadioFormField from "../radio-form-field";
import TextAreaFormField from "../text-area-form-field";

type Props = BookingFormFieldProps & {
  fieldName: string;
  readOnly?: boolean;
  defaultValue?: string | boolean;
};

function CustomFormFieldRenderer({
  fieldName,
  fieldLabel,
  fieldType,
  placeholderText,
  requiredField,
  readOnly = false,
  defaultValue,
}: Props) {
  switch (fieldType) {
    case FieldType.Text:
      return (
        <FormField
          label={fieldLabel}
          fieldName={fieldName}
          placeholder={placeholderText}
          required={requiredField}
          readOnly={readOnly}
          defaultValue={
            defaultValue === undefined ? defaultValue : String(defaultValue)
          }
        />
      );
    case FieldType.TextArea:
      return (
        <TextAreaFormField
          label={fieldLabel}
          fieldName={fieldName}
          placeholder={placeholderText}
          required={requiredField}
          readOnly={readOnly}
          defaultValue={
            defaultValue === undefined ? defaultValue : String(defaultValue)
          }
        />
      );
    case FieldType.Number:
      return (
        <FormField
          label={fieldLabel}
          fieldName={fieldName}
          placeholder={placeholderText}
          required={requiredField}
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
          label={
            <label className="text-viewer">
              <LinkifyTextViewer>{fieldLabel}</LinkifyTextViewer>
            </label>
          }
          fieldName={fieldName}
          required={requiredField}
          type="checkbox"
          readOnly={readOnly}
          defaultValue={
            defaultValue === undefined ? defaultValue : Boolean(defaultValue)
          }
        />
      );
    default:
      return null;
  }
}

export default CustomFormFieldRenderer;
