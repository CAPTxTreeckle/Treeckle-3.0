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

type Props = ButtonProps & {
  popUpContent?: string | null;
  showDeleteModal?: boolean;
  getDeleteModalProps?: DeleteModalPropsGetter;
};

const defaultGetDeleteModalProps = ({
  hideModal,
}: {
  hideModal: () => void;
}) => ({
  title: "Delete",
  content: "Are you sure you want to delete?",
  onYes: hideModal,
  onNo: hideModal,
  icon: <Icon name="trash alternate outline" />,
});

function DeleteButton({
  popUpContent = "Delete",
  showDeleteModal = true,
  getDeleteModalProps,
  onClick,
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
      content={popUpContent}
      position="top center"
      disabled={!popUpContent}
      trigger={
        <Button
          icon="trash alternate"
          color="red"
          onClick={(event, data) => {
            onClick?.(event, data);
            showDeleteModal && showModal();
          }}
          {...props}
        />
      }
    />
  );
}

export default DeleteButton;
