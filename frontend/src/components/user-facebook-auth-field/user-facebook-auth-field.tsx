import { useContext } from "react";
import { Button } from "semantic-ui-react";
import { UserSelfContext } from "../../contexts/user-self-provider";
import HorizontalLayoutContainer from "../horizontal-layout-container";

type Props = {
  labelClassName?: string;
};

function UserFacebookAuthField({ labelClassName }: Props) {
  const { self } = useContext(UserSelfContext);

  return (
    <HorizontalLayoutContainer align="center">
      <span className={labelClassName}>
        {self?.hasFacebookAuth ? "Linked" : "Not linked"}
      </span>

      <Button
        size="mini"
        compact
        color="blue"
        content={self?.hasFacebookAuth ? "Unlink" : "Link"}
        disabled
      />
    </HorizontalLayoutContainer>
  );
}

export default UserFacebookAuthField;
