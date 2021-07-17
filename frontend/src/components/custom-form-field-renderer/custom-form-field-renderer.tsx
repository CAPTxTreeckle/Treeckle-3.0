import { FieldType, BookingFormFieldProps } from "../../types/venues";
import FormField from "../form-field";
import LinkifyTextViewer from "../linkify-text-viewer";
import RadioFormField from "../radio-form-field";
import TextAreaFormField from "../text-area-form-field";

type Props = BookingFormFieldProps & {
  fieldName: string;
  readOnly?: boolean;
  defaultValue?: string | boolean;
  hidden?: boolean;
};

function CustomFormFieldRenderer({
  fieldName,
  fieldLabel,
  fieldType,
  placeholderText,
  requiredField,
  readOnly = false,
  defaultValue,
  hidden = false,
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
          hidden={hidden}
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
          hidden={hidden}
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
          hidden={hidden}
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
          type="checkbox"
          readOnly={readOnly}
          defaultValue={
            defaultValue === undefined ? defaultValue : Boolean(defaultValue)
          }
          hidden={hidden}
        />
      );
    default:
      return null;
  }
}

export default CustomFormFieldRenderer;
