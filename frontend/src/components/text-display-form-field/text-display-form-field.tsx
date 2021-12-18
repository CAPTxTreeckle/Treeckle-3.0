import clsx from "clsx";
import { Form, SemanticWIDTHS } from "semantic-ui-react";

import TextArea from "../text-area";
import styles from "./text-display-form-field.module.scss";

type Props = {
  className?: string;
  text: string;
  minRows?: number;
  maxRows?: number;
  width?: SemanticWIDTHS;
};

function TextDisplayFormField({
  className,
  text,
  minRows = 1,
  maxRows = 18,
  width,
}: Props) {
  return (
    <Form.Field
      className={clsx(styles.field, className)}
      control={TextArea}
      width={width}
      readOnly
      value={text}
      rows={minRows}
      minRows={minRows}
      maxRows={Math.max(maxRows, minRows)}
    />
  );
}

export default TextDisplayFormField;
