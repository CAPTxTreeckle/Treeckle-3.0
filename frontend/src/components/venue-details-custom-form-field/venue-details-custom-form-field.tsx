import { SyntheticEvent, useState, useEffect } from "react";
import classNames from "classnames";
import { DraggableProvidedDragHandleProps } from "react-beautiful-dnd";
import { useFormContext } from "react-hook-form";
import { DropdownProps, Form, Icon, Popup, Segment } from "semantic-ui-react";
import {
  FIELD_LABEL,
  FIELD_TYPE,
  PLACEHOLDER_TEXT,
  REQUIRED_FIELD,
  CUSTOM_VENUE_BOOKING_FORM_FIELDS,
} from "../../constants";
import {
  FieldType,
  CustomVenueBookingFormFieldProps,
  VenueFormProps,
} from "../../types/venues";
import FormField from "../form-field";
import RadioFormField from "../radio-form-field";
import DropdownSelectorFormField from "../dropdown-selector-form-field";
import styles from "./venue-details-custom-form-field.module.scss";

const typeOptions = [
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
    icon: "radio",
  },
];

type Props = {
  index: number;
  onDeleteField: () => void;
  defaultValues?: CustomVenueBookingFormFieldProps;
  dragHandleProps?: DraggableProvidedDragHandleProps;
};

const defaultFormProps: CustomVenueBookingFormFieldProps = {
  [FIELD_TYPE]: FieldType.Text,
  [FIELD_LABEL]: "",
  [REQUIRED_FIELD]: false,
  [PLACEHOLDER_TEXT]: "",
};

function VenueDetailsCustomFormField({
  index,
  onDeleteField,
  defaultValues = defaultFormProps,
  dragHandleProps,
}: Props) {
  const { setValue, setFocus } = useFormContext<VenueFormProps>();
  const [isBooleanField, setBooleanField] = useState(
    defaultValues.fieldType === FieldType.Boolean,
  );
  const fieldType = `${CUSTOM_VENUE_BOOKING_FORM_FIELDS}.${index}.${FIELD_TYPE}`;
  const fieldLabel = `${CUSTOM_VENUE_BOOKING_FORM_FIELDS}.${index}.${FIELD_LABEL}`;
  const placeholderText = `${CUSTOM_VENUE_BOOKING_FORM_FIELDS}.${index}.${PLACEHOLDER_TEXT}`;
  const requiredField = `${CUSTOM_VENUE_BOOKING_FORM_FIELDS}.${index}.${REQUIRED_FIELD}`;

  const onSelect = (
    _: SyntheticEvent<HTMLElement, Event>,
    { value }: DropdownProps,
  ) => {
    if (value === FieldType.Boolean) {
      setBooleanField(true);
      setValue(
        requiredField as "customVenueBookingFormFields.0.requiredField",
        false,
      );
      setValue(
        placeholderText as "customVenueBookingFormFields.0.placeholderText",
        "",
      );
    } else {
      setBooleanField(false);
    }
  };

  useEffect(() => {
    setFocus(fieldLabel as "customVenueBookingFormFields.0.fieldLabel");
  }, [setFocus, fieldLabel]);

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
                <i className="fas fa-arrows-v" />
              </Segment>
            }
            on="hover"
            content="Drag and move up/down to rearrange the fields"
          />
        </Segment.Group>

        <Segment>
          <Form.Group widths="equal">
            <FormField
              required
              label="Field Label"
              inputName={fieldLabel}
              defaultValue={defaultValues.fieldLabel}
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
            className={classNames(
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
            className={classNames(isBooleanField && styles.removeLeftBorder)}
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
          />
        </Segment.Group>
      </Segment.Group>
    </div>
  );
}

export default VenueDetailsCustomFormField;
