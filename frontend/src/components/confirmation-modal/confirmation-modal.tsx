import { ReactNode } from "react";
import {
  Button,
  ButtonProps,
  Header,
  Modal,
  ModalProps,
  TransitionablePortal,
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
  size?: ModalProps["size"];
};

export type ConfirmationModalPropsGetter = (props: {
  open: boolean;
  onExited: () => void;
  hideModal: () => void;
}) => Partial<ConfirmationModalProps>;

function ConfirmationModal({
  open,
  onExited,
  onClose,
  yesButtonProps,
  noButtonProps,
  icon,
  title,
  content,
  size = "tiny",
}: ConfirmationModalProps) {
  return (
    <TransitionablePortal
      transition={{ animation: "fade down" }}
      open={open}
      onHide={onExited}
    >
      <Modal size={size} basic open onClose={onClose}>
        <Header icon={Boolean(icon)} align="center">
          {icon}
          {title}
        </Header>

        <Modal.Content>{content}</Modal.Content>

        <Modal.Actions>
          <Button
            color="red"
            inverted
            icon="times"
            content="No"
            {...noButtonProps}
          />
          <Button
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
