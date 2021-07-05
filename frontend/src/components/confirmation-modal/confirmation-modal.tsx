import { ReactNode } from "react";
import { TransitionablePortal, Modal, Header, Button } from "semantic-ui-react";

export type ConfirmationModalProps = {
  open: boolean;
  onExited: () => void;
  onClose: () => void;
  onYes: () => void;
  onNo: () => void;
  icon?: ReactNode;
  title: ReactNode;
  content: ReactNode;
};

function ConfirmationModal({
  open,
  onExited,
  onClose,
  onYes,
  onNo,
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
            onClick={onNo}
            basic
            color="red"
            inverted
            icon="times"
            content="No"
          />
          <Button
            onClick={onYes}
            basic
            color="green"
            inverted
            icon="checkmark"
            content="Yes"
          />
        </Modal.Actions>
      </Modal>
    </TransitionablePortal>
  );
}

export default ConfirmationModal;
