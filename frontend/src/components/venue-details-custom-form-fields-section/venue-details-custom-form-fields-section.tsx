import {
  DragDropContext,
  Draggable,
  Droppable,
  DropResult,
} from "react-beautiful-dnd";
import { useFieldArray } from "react-hook-form";
import { Button, Form, Popup } from "semantic-ui-react";
import { BOOKING_FORM_FIELDS } from "../../constants";
import { FieldType, VenueFormProps } from "../../types/venues";
import VenueDetailsCustomFormField from "../venue-details-custom-form-field";

function VenueDetailsCustomFormFieldsSection() {
  const { fields, append, remove, move } = useFieldArray<VenueFormProps>({
    name: BOOKING_FORM_FIELDS,
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
          <Droppable droppableId={BOOKING_FORM_FIELDS}>
            {({ innerRef, droppableProps, placeholder }) => (
              <div ref={innerRef} {...droppableProps}>
                {fields.map(
                  (
                    {
                      id,
                      fieldLabel = "",
                      placeholderText = "",
                      fieldType = FieldType.Text,
                      requiredField = true,
                    },
                    index,
                  ) => (
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
                  ),
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
      />
    </>
  );
}

export default VenueDetailsCustomFormFieldsSection;
