import { Ref } from "react";
import TextareaAutosize from "react-textarea-autosize";

type Props = Parameters<typeof TextareaAutosize>[0] & {
  innerRef?: Ref<HTMLTextAreaElement>;
};

function TextArea({ innerRef, ...textareaAutosizeProps }: Props) {
  return <TextareaAutosize {...textareaAutosizeProps} ref={innerRef} />;
}

export default TextArea;
