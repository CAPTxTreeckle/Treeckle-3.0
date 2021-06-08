import { MenuItem } from "semantic-ui-react";

type Props = {
  onTabClick?: () => void;
};

function BurgerTab({ onTabClick }: Props) {
  return <MenuItem onClick={onTabClick} icon="sidebar" />;
}

export default BurgerTab;
