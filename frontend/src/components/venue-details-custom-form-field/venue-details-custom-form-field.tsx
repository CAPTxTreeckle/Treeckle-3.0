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
  LABEL,
  TYPE,
  PLACEHOLDER_TEXT,
  REQUIRED,
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
    text: "Short Response",
    icon: "minus",
  },
  {
    value: FieldType.TextArea,
    text: "Long Response",
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
  typeFieldName,
  labelFieldName,
  placeholderTextFieldName,
}: {
  typeFieldName: string;
  labelFieldName: string;
  placeholderTextFieldName: string;
}) => {
  const type = useWatch({ name: typeFieldName });
  const isBooleanField = type === FieldType.Boolean;
  const isTextAreaField = type === FieldType.TextArea;

  return (
    <Segment>
      <Form.Group widths="equal">
        <TextAreaFormField
          required
          label="Label / Question"
          name={labelFieldName}
        />

        {!isBooleanField &&
          (isTextAreaField ? (
            <TextAreaFormField
              label="Placeholder Text"
              name={placeholderTextFieldName}
            />
          ) : (
            <FormField
              label="Placeholder Text"
              name={placeholderTextFieldName}
            />
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
  const typeFieldName = `${BOOKING_FORM_FIELDS}.${index}.${TYPE}` as const;
  const labelFieldName = `${BOOKING_FORM_FIELDS}.${index}.${LABEL}` as const;
  const placeholderTextFieldName =
    `${BOOKING_FORM_FIELDS}.${index}.${PLACEHOLDER_TEXT}` as const;
  const requiredFieldName =
    `${BOOKING_FORM_FIELDS}.${index}.${REQUIRED}` as const;

  const onSelectFieldType = (
    _: SyntheticEvent<HTMLElement, Event>,
    { value: typeValue }: DropdownProps,
  ) => {
    if (typeValue === FieldType.Boolean) {
      setValue(placeholderTextFieldName, "");
    }
  };

  return (
    <div className={styles.venueDetailsCustomFormField}>
      <Segment.Group className={styles.card} raised>
        <Segment.Group className={styles.topSection} horizontal>
          <Segment className={styles.fieldNumberContainer}>{index + 1}</Segment>

          <Segment className={styles.typeSelectorContainer}>
            <DropdownSelectorFormField
              className={styles.selector}
              name={typeFieldName}
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
          typeFieldName={typeFieldName}
          labelFieldName={labelFieldName}
          placeholderTextFieldName={placeholderTextFieldName}
        />

        <Segment.Group className={styles.bottomSection} horizontal>
          <Segment className={styles.requiredFieldContainer}>
            <RadioFormField
              label="Required"
              name={requiredFieldName}
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
