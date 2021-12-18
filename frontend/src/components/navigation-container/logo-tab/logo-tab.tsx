import { Link } from "react-router-dom";
import { Image, MenuItem } from "semantic-ui-react";

import treeckleLogo from "../../../assets/treeckle-title-side-transparent.png";
import { DASHBOARD_PATH } from "../../../routes/paths";

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
