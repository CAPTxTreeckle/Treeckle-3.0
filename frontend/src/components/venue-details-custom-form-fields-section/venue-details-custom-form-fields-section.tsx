import {
  DragDropContext,
  Draggable,
  Droppable,
  DropResult,
} from "react-beautiful-dnd";
import { useFieldArray } from "react-hook-form";
import { Button, Form, Popup } from "semantic-ui-react";
import { CUSTOM_VENUE_BOOKING_FORM_FIELDS } from "../../constants";
import {
  FieldType,
  CustomVenueBookingFormFieldProps,
} from "../../types/venues";
import VenueDetailsCustomFormField from "../venue-details-custom-form-field";

function VenueDetailsCustomFormFieldsSection() {
  const { fields, append, remove, move } = useFieldArray<{
    [CUSTOM_VENUE_BOOKING_FORM_FIELDS]: CustomVenueBookingFormFieldProps[];
  }>({
    name: CUSTOM_VENUE_BOOKING_FORM_FIELDS,
  });

  const onDragEnd = ({ destination, source }: DropResult) => {
    if (!destination) {
      return;
    }

    const { index: destinationIndex } = destination;
    const { index: sourceIndex } = source;

    if (destinationIndex === sourceIndex) {
      return;
    }

    move(sourceIndex, destinationIndex);
  };

  return (
    <>
      <Form.Field>
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId={CUSTOM_VENUE_BOOKING_FORM_FIELDS}>
            {({ innerRef, droppableProps, placeholder }) => (
              <div ref={innerRef} {...droppableProps}>
                {fields.map(
                  (
                    {
                      id,
                      fieldLabel = "",
                      placeholderText = "",
                      fieldType = FieldType.Text,
                      requiredField = false,
                    },
                    index,
                  ) => {
                    return (
                      <Draggable
                        key={id}
                        index={index}
                        draggableId={id ?? `${index}`}
                      >
                        {({ innerRef, draggableProps, dragHandleProps }) => (
                          <div ref={innerRef} {...draggableProps}>
                            <VenueDetailsCustomFormField
                              index={index}
                              onDeleteField={() => remove(index)}
                              defaultValues={{
                                fieldLabel,
                                placeholderText,
                                fieldType,
                                requiredField,
                              }}
                              dragHandleProps={dragHandleProps}
                            />
                          </div>
                        )}
                      </Draggable>
                    );
                  },
                )}
                {placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </Form.Field>

      <Popup
        content="Add a new field"
        trigger={
          <Button
            type="button"
            color="green"
            icon="plus"
            onClick={() => append({})}
          />
        }
        position="right center"
        on="hover"
      />
    </>
  );
}

export default VenueDetailsCustomFormFieldsSection;
