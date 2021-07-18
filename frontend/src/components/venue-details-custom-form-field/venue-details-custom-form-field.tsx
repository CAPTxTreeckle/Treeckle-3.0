import { SyntheticEvent } from "react";
import { DraggableProvidedDragHandleProps } from "react-beautiful-dnd";
import { useFormContext, useWatch } from "react-hook-form";
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
import { FieldType, VenueFormProps } from "../../types/venues";
import FormField from "../form-field";
import RadioFormField from "../radio-form-field";
import DropdownSelectorFormField from "../dropdown-selector-form-field";
import TextAreaFormField from "../text-area-form-field";
import styles from "./venue-details-custom-form-field.module.scss";

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

const MiddleSection = ({
  fieldType,
  fieldLabel,
  placeholderText,
}: {
  fieldType: string;
  fieldLabel: string;
  placeholderText: string;
}) => {
  const fieldTypeValue = useWatch({ name: fieldType });
  const isBooleanField = fieldTypeValue === FieldType.Boolean;
  const isTextAreaField = fieldTypeValue === FieldType.TextArea;

  return (
    <Segment>
      <Form.Group widths="equal">
        {isBooleanField ? (
          <TextAreaFormField
            required
            label="Field Label"
            fieldName={fieldLabel}
            minRows={3}
            maxRows={8}
          />
        ) : (
          <FormField required label="Field Label" fieldName={fieldLabel} />
        )}

        {!isBooleanField &&
          (isTextAreaField ? (
            <TextAreaFormField
              label="Placeholder Text"
              fieldName={placeholderText}
              minRows={3}
              maxRows={8}
            />
          ) : (
            <FormField label="Placeholder Text" fieldName={placeholderText} />
          ))}
      </Form.Group>
    </Segment>
  );
};

type Props = {
  index: number;
  onDeleteField: () => void;
  dragHandleProps?: DraggableProvidedDragHandleProps;
};

function VenueDetailsCustomFormField({
  index,
  onDeleteField,
  dragHandleProps,
}: Props) {
  const { setValue } = useFormContext<VenueFormProps>();
  const fieldType = `${BOOKING_FORM_FIELDS}.${index}.${FIELD_TYPE}` as const;
  const fieldLabel = `${BOOKING_FORM_FIELDS}.${index}.${FIELD_LABEL}` as const;
  const placeholderText =
    `${BOOKING_FORM_FIELDS}.${index}.${PLACEHOLDER_TEXT}` as const;
  const requiredField =
    `${BOOKING_FORM_FIELDS}.${index}.${REQUIRED_FIELD}` as const;

  const onSelectFieldType = (
    _: SyntheticEvent<HTMLElement, Event>,
    { value: fieldTypeValue }: DropdownProps,
  ) => {
    if (fieldTypeValue === FieldType.Boolean) {
      setValue(placeholderText, "");
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
              fieldName={fieldType}
              defaultOptions={typeOptions}
              required
              onChangeEffect={onSelectFieldType}
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

        <MiddleSection
          fieldType={fieldType}
          fieldLabel={fieldLabel}
          placeholderText={placeholderText}
        />

        <Segment.Group className={styles.bottomSection} horizontal>
          <Segment className={styles.requiredFieldContainer}>
            <RadioFormField
              label="Required Field"
              fieldName={requiredField}
              type="toggle"
            />
          </Segment>

          <Segment />

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
