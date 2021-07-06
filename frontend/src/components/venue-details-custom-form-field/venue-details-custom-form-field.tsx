import { SyntheticEvent, useState } from "react";
import clsx from "clsx";
import { DraggableProvidedDragHandleProps } from "react-beautiful-dnd";
import { useFormContext } from "react-hook-form";
import {
  DropdownItemProps,
  DropdownProps,
  Form,
  Icon,
  Popup,
  Segment,
} from "semantic-ui-react";
import {
  FIELD_LABEL,
  FIELD_TYPE,
  PLACEHOLDER_TEXT,
  REQUIRED_FIELD,
  BOOKING_FORM_FIELDS,
} from "../../constants";
import {
  FieldType,
  BookingFormFieldProps,
  VenueFormProps,
} from "../../types/venues";
import FormField from "../form-field";
import RadioFormField from "../radio-form-field";
import DropdownSelectorFormField from "../dropdown-selector-form-field";
import styles from "./venue-details-custom-form-field.module.scss";
import TextAreaFormField from "../text-area-form-field";

const typeOptions: DropdownItemProps[] = [
  {
    value: FieldType.Text,
    text: "Single-line Input",
    icon: "minus",
  },
  {
    value: FieldType.TextArea,
    text: "Multi-line Input",
    icon: "bars",
  },
  {
    value: FieldType.Number,
    text: "Number",
    icon: "sort numeric down",
  },
  {
    value: FieldType.Boolean,
    text: "Yes / No",
    icon: "check square",
  },
];

type Props = {
  index: number;
  onDeleteField: () => void;
  defaultValues?: BookingFormFieldProps;
  dragHandleProps?: DraggableProvidedDragHandleProps;
};

const defaultFormProps: BookingFormFieldProps = {
  [FIELD_TYPE]: FieldType.Text,
  [FIELD_LABEL]: "",
  [REQUIRED_FIELD]: true,
  [PLACEHOLDER_TEXT]: "",
};

function VenueDetailsCustomFormField({
  index,
  onDeleteField,
  defaultValues = defaultFormProps,
  dragHandleProps,
}: Props) {
  const { setValue } = useFormContext<VenueFormProps>();
  const [isBooleanField, setBooleanField] = useState(
    defaultValues.fieldType === FieldType.Boolean,
  );
  const fieldType = `${BOOKING_FORM_FIELDS}.${index}.${FIELD_TYPE}` as const;
  const fieldLabel = `${BOOKING_FORM_FIELDS}.${index}.${FIELD_LABEL}` as const;
  const placeholderText =
    `${BOOKING_FORM_FIELDS}.${index}.${PLACEHOLDER_TEXT}` as const;
  const requiredField =
    `${BOOKING_FORM_FIELDS}.${index}.${REQUIRED_FIELD}` as const;

  const onSelect = (
    _: SyntheticEvent<HTMLElement, Event>,
    { value }: DropdownProps,
  ) => {
    if (value === FieldType.Boolean) {
      setBooleanField(true);
      setValue(requiredField, true);
      setValue(placeholderText, "");
    } else {
      setBooleanField(false);
    }
  };

  return (
    <div className={styles.venueDetailsCustomFormField}>
      <Segment.Group className={styles.card} raised>
        <Segment.Group className={styles.topSection} horizontal>
          <Segment className={styles.fieldNumberContainer}>{index + 1}</Segment>

          <Segment className={styles.fieldTypeSelectorContainer}>
            <DropdownSelectorFormField
              className={styles.selector}
              inputName={fieldType}
              defaultOptions={typeOptions}
              defaultValue={defaultValues.fieldType}
              required
              onChangeEffect={onSelect}
            />
          </Segment>

          <Segment />

          <Popup
            trigger={
              <Segment className={styles.dragSection} {...dragHandleProps}>
                <Icon name="arrows alternate vertical" />
              </Segment>
            }
            on="hover"
            content="Drag and move up/down to rearrange the fields"
            hideOnScroll
          />
        </Segment.Group>

        <Segment>
          <Form.Group widths="equal">
            <TextAreaFormField
              required
              label="Field Label"
              inputName={fieldLabel}
              defaultValue={defaultValues.fieldLabel}
              rows={isBooleanField ? 8 : 1}
            />

            <FormField
              label="Placeholder Text"
              inputName={placeholderText}
              defaultValue={defaultValues.placeholderText}
              hidden={isBooleanField}
            />
          </Form.Group>
        </Segment>

        <Segment.Group className={styles.bottomSection} horizontal>
          <Segment
            className={clsx(
              isBooleanField && "hidden-display",
              styles.requiredFieldContainer,
            )}
          >
            <RadioFormField
              label="Required Field"
              inputName={requiredField}
              defaultValue={defaultValues.requiredField}
              type="toggle"
            />
          </Segment>

          <Segment
            className={clsx(isBooleanField && styles.removeLeftBorder)}
          />

          <Popup
            content="Delete field"
            trigger={
              <Segment
                className={styles.deleteButtonContainer}
                onClick={onDeleteField}
              >
                <Icon color="red" fitted name="trash alternate outline" />
              </Segment>
            }
            position="left center"
            hideOnScroll
          />
        </Segment.Group>
      </Segment.Group>
    </div>
  );
}

export default VenueDetailsCustomFormField;
