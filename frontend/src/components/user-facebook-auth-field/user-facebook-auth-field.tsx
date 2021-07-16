import { Button } from "semantic-ui-react";
import { useAppSelector } from "../../redux/hooks";
import { selectCurrentUserDisplayInfo } from "../../redux/slices/current-user-slice";
import HorizontalLayoutContainer from "../horizontal-layout-container";

type Props = {
  labelClassName?: string;
};

function UserFacebookAuthField({ labelClassName }: Props) {
  const user = useAppSelector(selectCurrentUserDisplayInfo);

  return (
    <HorizontalLayoutContainer align="center">
      <span className={labelClassName}>
        {user?.hasFacebookAuth ? "Linked" : "Not linked"}
      </span>

      <Button
        size="mini"
        compact
        color="blue"
        content={user?.hasFacebookAuth ? "Unlink" : "Link"}
        disabled
      />
    </HorizontalLayoutContainer>
  );
}

export default UserFacebookAuthField;
