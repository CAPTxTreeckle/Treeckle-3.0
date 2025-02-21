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
  BOOKING_FORM_FIELDS,
  LABEL,
  PLACEHOLDER,
  REQUIRED,
  TYPE,
} from "../../constants";
import { FieldType, VenueFormProps } from "../../types/venues";
import DropdownSelectorFormField from "../dropdown-selector-form-field";
import FormField from "../form-field";
import RadioFormField from "../radio-form-field";
import TextAreaFormField from "../text-area-form-field";
import styles from "./venue-details-custom-form-field.module.scss";

const TYPE_OPTIONS: DropdownItemProps[] = [
  {
    value: FieldType.Text,
    text: "Short Response",
    icon: "minus",
  },
  {
    value: FieldType.TextArea,
    text: "Long Response",
    icon: { name: "align left", flipped: "vertically" },
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
  {
    value: FieldType.TextDisplay,
    text: "Display Text",
    icon: { className: "fas fa-text" },
  },
];

const NO_PLACEHOLDER_FIELD_TYPES = [FieldType.Boolean, FieldType.TextDisplay];
const NO_REQUIRED_FIELD_TYPES = [FieldType.TextDisplay];

const MiddleSection = ({
  typeFieldName,
  labelFieldName,
  placeholderFieldName,
}: {
  typeFieldName: string;
  labelFieldName: string;
  placeholderFieldName: string;
}) => {
  const type = useWatch({ name: typeFieldName }) as FieldType;

  return (
    <Segment>
      <Form.Group widths="equal">
        <TextAreaFormField
          required
          label={type === FieldType.TextDisplay ? "Text" : "Label / Question"}
          name={labelFieldName}
        />

        {!NO_PLACEHOLDER_FIELD_TYPES.includes(type) &&
          (type === FieldType.TextArea ? (
            <TextAreaFormField
              label="Placeholder Text"
              name={placeholderFieldName}
            />
          ) : (
            <FormField label="Placeholder Text" name={placeholderFieldName} />
          ))}
      </Form.Group>
    </Segment>
  );
};

const RequiredFieldSection = ({
  typeFieldName,
  requiredFieldName,
}: {
  typeFieldName: string;
  requiredFieldName: string;
}) => {
  const type = useWatch({ name: typeFieldName }) as FieldType;

  return NO_REQUIRED_FIELD_TYPES.includes(type) ? null : (
    <Segment className={styles.requiredFieldContainer}>
      <RadioFormField label="Required" name={requiredFieldName} type="toggle" />
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
  const placeholderFieldName =
    `${BOOKING_FORM_FIELDS}.${index}.${PLACEHOLDER}` as const;
  const requiredFieldName =
    `${BOOKING_FORM_FIELDS}.${index}.${REQUIRED}` as const;

  const onSelectFieldType = (
    _: SyntheticEvent<HTMLElement, Event>,
    { value }: DropdownProps,
  ) => {
    const type = value as FieldType;

    if (NO_PLACEHOLDER_FIELD_TYPES.includes(type)) {
      setValue(placeholderFieldName, "");
    }

    if (NO_REQUIRED_FIELD_TYPES.includes(type)) {
      setValue(requiredFieldName, false);
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
              defaultOptions={TYPE_OPTIONS}
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
          placeholderFieldName={placeholderFieldName}
        />

        <Segment.Group className={styles.bottomSection} horizontal>
          <RequiredFieldSection
            typeFieldName={typeFieldName}
            requiredFieldName={requiredFieldName}
          />

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
