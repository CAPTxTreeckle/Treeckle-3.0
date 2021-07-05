import { ReactNode } from "react";
import {
  TransitionablePortal,
  Modal,
  Header,
  Button,
  ButtonProps,
} from "semantic-ui-react";

export type ConfirmationModalProps = {
  open: boolean;
  onExited: () => void;
  onClose: () => void;
  yesButtonProps?: ButtonProps;
  noButtonProps?: ButtonProps;
  icon?: ReactNode;
  title: ReactNode;
  content: ReactNode;
};

function ConfirmationModal({
  open,
  onExited,
  onClose,
  yesButtonProps,
  noButtonProps,
  icon,
  title,
  content,
}: ConfirmationModalProps) {
  return (
    <TransitionablePortal
      transition={{ animation: "fade down" }}
      open={open}
      onHide={onExited}
    >
      <Modal size="tiny" basic open onClose={onClose}>
        <Header icon={Boolean(icon)} align="center">
          {icon}
          {title}
        </Header>

        <Modal.Content>{content}</Modal.Content>

        <Modal.Actions>
          <Button
            basic
            color="red"
            inverted
            icon="times"
            content="No"
            {...noButtonProps}
          />
          <Button
            basic
            color="green"
            inverted
            icon="checkmark"
            content="Yes"
            {...yesButtonProps}
          />
        </Modal.Actions>
      </Modal>
    </TransitionablePortal>
  );
}

export default ConfirmationModal;
