import { memo, ReactNode } from "react";
import { useModal } from "react-modal-hook";
import { Button, ButtonProps, Popup } from "semantic-ui-react";

import ConfirmationModal, {
  ConfirmationModalPropsGetter,
} from "../confirmation-modal";

type Props = Omit<ButtonProps, "onClick"> & {
  popupContent?: ReactNode;
  getConfirmationModalProps?: ConfirmationModalPropsGetter;
  onClick?: (props: {
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>;
    data: ButtonProps;
    showModal: () => void;
  }) => void;
};

const defaultGetConfirmationModalProps = ({
  hideModal,
}: {
  hideModal: () => void;
}) => ({
  // title: "Delete",
  // content: "Are you sure you want to delete?",
  title: "Confirm",
  content: "Do you want to confirm?",
  yesButtonProps: { onClick: hideModal },
  noButtonProps: { onClick: hideModal },
  // icon: <Icon name="trash alternate outline" />,
});

function ConfirmationModalButton({
  popupContent = null,
  getConfirmationModalProps,
  onClick = ({ showModal }) => showModal(),
  ...props
}: Props) {
  const [showModal, hideModal] = useModal(
    ({ in: open, onExited }: { in: boolean; onExited: () => void }) => (
      <ConfirmationModal
        open={open}
        onExited={onExited}
        onClose={hideModal}
        {...{
          ...defaultGetConfirmationModalProps({ hideModal }),
          ...getConfirmationModalProps?.({ open, onExited, hideModal }),
        }}
      />
    ),
    [getConfirmationModalProps],
  );

  return (
    <Popup
      content={popupContent}
      position="top center"
      disabled={!popupContent}
      trigger={
        <Button
          // icon="trash alternate"
          // color="red"
          onClick={(event, data) => onClick({ event, data, showModal })}
          {...props}
        />
      }
      hideOnScroll
      on="hover"
    />
  );
}

export default memo(ConfirmationModalButton);
