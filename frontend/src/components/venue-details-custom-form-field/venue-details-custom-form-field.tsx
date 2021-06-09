import { useState } from "react";
import { DraggableProvidedDragHandleProps } from "react-beautiful-dnd";
import { useController, useFormContext } from "react-hook-form";
import { Card, Form, Icon, Popup, Select, Ref } from "semantic-ui-react";
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
import "./venue-details-custom-form-field.scss";

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
  const { setValue } = useFormContext<VenueFormProps>();
  const [isBooleanField, setBooleanField] = useState(
    defaultValues[FIELD_TYPE] === FieldType.Boolean,
  );
  const fieldType = `${CUSTOM_VENUE_BOOKING_FORM_FIELDS}.${index}.${FIELD_TYPE}`;
  const fieldLabel = `${CUSTOM_VENUE_BOOKING_FORM_FIELDS}.${index}.${FIELD_LABEL}`;
  const placeholderText = `${CUSTOM_VENUE_BOOKING_FORM_FIELDS}.${index}.${PLACEHOLDER_TEXT}`;
  const requiredField = `${CUSTOM_VENUE_BOOKING_FORM_FIELDS}.${index}.${REQUIRED_FIELD}`;

  const {
    field: { onChange, onBlur, value, ref },
  } = useController({
    name: fieldType,
    defaultValue: defaultValues,
    rules: { required: true },
  });

  return (
    <div className="venue-details-custom-form-field-container">
      <Card className="venue-details-custom-form-field" raised fluid>
        <Card.Content className="top-bar">
          <div className="section left">
            <div className="field-number">{index + 1}</div>

            <Ref innerRef={ref}>
              <Select
                value={value}
                onBlur={onBlur}
                onChange={(_, { value }) => {
                  onChange(value);

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
                }}
                className="type-selector"
                options={typeOptions}
              />
            </Ref>
          </div>

          <div className="section right">
            <Popup
              trigger={
                <div {...dragHandleProps} className="drag-zone">
                  <Icon name="braille" fitted />
                </div>
              }
              on="hover"
              content="Drag and move up/down to rearrange the fields"
            />
          </div>
        </Card.Content>

        <Card.Content>
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
        </Card.Content>

        <Card.Content className="bottom-bar">
          <div
            className="section left"
            style={isBooleanField ? { display: "none" } : undefined}
          >
            <RadioFormField
              label="Required Field"
              inputName={requiredField}
              defaultValue={defaultValues.requiredField}
              className="required-field-toggler"
              type="toggle"
            />
          </div>

          <div className="section right">
            <div className="delete-button">
              <Popup
                content="Delete field"
                trigger={
                  <Icon
                    color="red"
                    fitted
                    name="trash alternate outline"
                    link
                    onClick={onDeleteField}
                  />
                }
                position="left center"
              />
            </div>
          </div>
        </Card.Content>
      </Card>
    </div>
  );
}

export default VenueDetailsCustomFormField;
