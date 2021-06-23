import { Image, MenuItem } from "semantic-ui-react";
import { Link } from "react-router-dom";
import { DASHBOARD_PATH } from "../../../routes/paths";
import treeckleLogo from "../../../assets/treeckle-title-side-transparent.png";

type Props = {
  onTabClick?: () => void;
};

function LogoTab({ onTabClick }: Props) {
  return (
    <MenuItem as={Link} to={DASHBOARD_PATH} onClick={onTabClick}>
      <Image src={treeckleLogo} alt="Treeckle" size="small" />
    </MenuItem>
  );
}

export default LogoTab;
