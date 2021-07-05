import { ReactNode } from "react";
import { TransitionablePortal, Modal, ModalProps } from "semantic-ui-react";

type Props = {
  open: boolean;
  onExited: () => void;
  onClose: () => void;
  title: ReactNode;
  content: ReactNode;
  size?: ModalProps["size"];
  closeIcon?: boolean;
};

function BaseModal({
  open,
  onExited,
  onClose,
  title,
  content,
  size = "tiny",
  closeIcon = true,
}: Props) {
  return (
    <TransitionablePortal
      transition={{ animation: "fade down" }}
      open={open}
      onHide={onExited}
    >
      <Modal size={size} closeIcon={closeIcon} open onClose={onClose}>
        <Modal.Header>{title}</Modal.Header>

        <Modal.Content>{content}</Modal.Content>
      </Modal>
    </TransitionablePortal>
  );
}

export default BaseModal;
