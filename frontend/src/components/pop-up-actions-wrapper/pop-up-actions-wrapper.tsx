import {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useCallback,
  useState,
} from "react";
import {
  Button,
  Divider,
  Popup,
  PopupProps,
  SemanticWIDTHS,
} from "semantic-ui-react";

type Props = {
  children: ReactNode;
  actionButtons: ReactNode[];
  offsetRatio?: { widthRatio?: number; heightRatio?: number };
  vertical?: boolean;
  popupPosition?: PopupProps["position"];
  inverted?: boolean;
};

type PopupActionsWrapperContextType = {
  extraContent: ReactNode;
  setExtraContent: Dispatch<SetStateAction<ReactNode>>;
  closePopup: () => void;
};

export const PopupActionsWrapperContext =
  createContext<PopupActionsWrapperContextType>({
    extraContent: null,
    setExtraContent: () => new Error("setExtraContent not defined."),
    closePopup: () => new Error("setPopupOpen not defined."),
  });

function PopupActionsWrapper({
  children,
  actionButtons,
  offsetRatio: { widthRatio = 0, heightRatio = 0 } = {
    heightRatio: 0,
    widthRatio: 0,
  },
  vertical = false,
  popupPosition = "top center",
  inverted = false,
}: Props) {
  const [isPopupOpen, setPopupOpen] = useState(false);
  const [extraContent, setExtraContent] = useState<ReactNode>(null);

  const closePopup = useCallback(() => {
    setExtraContent(null);
    setPopupOpen(false);
  }, []);

  return (
    <PopupActionsWrapperContext.Provider
      value={{ extraContent, setExtraContent, closePopup }}
    >
      <Popup
        inverted={inverted}
        trigger={children}
        position={popupPosition}
        on="click"
        hideOnScroll
        size="huge"
        offset={({ popper: { width, height } }) => [
          width * widthRatio,
          height * heightRatio,
        ]}
        popperDependencies={[extraContent]}
        onClose={closePopup}
        onOpen={() => setPopupOpen(true)}
        open={isPopupOpen}
      >
        {extraContent && (
          <>
            {extraContent}
            <Divider />
          </>
        )}

        <Button.Group
          fluid
          widths={actionButtons.length as SemanticWIDTHS}
          vertical={vertical}
        >
          {actionButtons}
        </Button.Group>
      </Popup>
    </PopupActionsWrapperContext.Provider>
  );
}

export default PopupActionsWrapper;
