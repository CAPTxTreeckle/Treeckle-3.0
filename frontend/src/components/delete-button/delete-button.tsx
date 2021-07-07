import React, { memo } from "react";
import { useModal } from "react-modal-hook";
import { Button, Popup, ButtonProps, Icon } from "semantic-ui-react";
import ConfirmationModal, {
  ConfirmationModalProps,
} from "../confirmation-modal";

export type DeleteModalPropsGetter = (props: {
  open: boolean;
  onExited: () => void;
  hideModal: () => void;
}) => Partial<ConfirmationModalProps>;

type Props = Omit<ButtonProps, "onClick"> & {
  popupContent?: string | null;
  getDeleteModalProps?: DeleteModalPropsGetter;
  onClick?: (props: {
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>;
    data: ButtonProps;
    showModal: () => void;
  }) => void;
};

const defaultGetDeleteModalProps = ({
  hideModal,
}: {
  hideModal: () => void;
}) => ({
  title: "Delete",
  content: "Are you sure you want to delete?",
  yesButtonProps: { onClick: hideModal },
  noButtonProps: { onClick: hideModal },
  icon: <Icon name="trash alternate outline" />,
});

function DeleteButton({
  popupContent = null,
  getDeleteModalProps,
  onClick = ({ showModal }) => showModal(),
  ...props
}: Props) {
  const [showModal, hideModal] = useModal(
    ({ in: open, onExited }) => (
      <ConfirmationModal
        open={open}
        onExited={onExited}
        onClose={hideModal}
        {...{
          ...defaultGetDeleteModalProps({ hideModal }),
          ...getDeleteModalProps?.({ open, onExited, hideModal }),
        }}
      />
    ),
    [getDeleteModalProps],
  );

  return (
    <Popup
      content={popupContent}
      position="top center"
      disabled={!popupContent}
      trigger={
        <Button
          icon="trash alternate"
          color="red"
          onClick={(event, data) => onClick({ event, data, showModal })}
          {...props}
        />
      }
      hideOnScroll
      on="hover"
    />
  );
}

export default memo(DeleteButton);
