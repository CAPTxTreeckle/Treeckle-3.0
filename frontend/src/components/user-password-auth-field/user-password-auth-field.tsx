import { useState, useRef, FormEvent, useContext } from "react";
import { toast } from "react-toastify";
import { Button, Icon, Input } from "semantic-ui-react";
import { UserSelfContext } from "../../contexts/user-self-provider";
import { useUpdateSelf } from "../../custom-hooks/api/users-api";
import { resolveApiError } from "../../utils/error-utils";
import HorizontalLayoutContainer from "../horizontal-layout-container";
import styles from "./user-password-auth-field.module.scss";

type Props = {
  labelClassName?: string;
};

function UserPasswordAuthField({ labelClassName }: Props) {
  const { self, setSelf } = useContext(UserSelfContext);
  const [isSettingPassword, setSettingPassword] = useState(false);
  const [isShowingPassword, setShowingPassword] = useState(false);
  const passwordInputRef = useRef<HTMLInputElement>(null);
  const { loading, updateSelf } = useUpdateSelf();

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const password = passwordInputRef.current?.value.trim();

    if (!password || loading) {
      return;
    }

    try {
      const updatedSelf = await updateSelf({ password });

      setSelf(updatedSelf);
      setSettingPassword(false);
      setShowingPassword(false);

      toast.success("Your password has been updated successfully.");
    } catch (error) {
      resolveApiError(error);
    }
  };

  return isSettingPassword ? (
    <form onSubmit={onSubmit}>
      <HorizontalLayoutContainer>
        <Input
          size="small"
          className={styles.passwordField}
          action
          icon
          iconPosition="left"
        >
          <Icon
            name={isShowingPassword ? "eye slash" : "eye"}
            link
            onClick={() => setShowingPassword(!isShowingPassword)}
          />

          <input
            className={styles.input}
            ref={passwordInputRef}
            type={isShowingPassword ? undefined : "password"}
            required
          />

          <Button
            loading={loading}
            disabled={loading}
            size="small"
            type="submit"
            icon="check"
            color="green"
          />
        </Input>

        <Button
          size="small"
          type="button"
          color="red"
          icon="times"
          onClick={() => {
            setSettingPassword(false);
            setShowingPassword(false);
          }}
        />
      </HorizontalLayoutContainer>
    </form>
  ) : (
    <HorizontalLayoutContainer align="center">
      <span className={labelClassName}>
        {self?.hasPasswordAuth ? "Active" : "Inactive"}
      </span>

      <Button
        onClick={() => setSettingPassword(true)}
        size="mini"
        compact
        color="blue"
        content={self?.hasPasswordAuth ? "Change" : "Activate"}
      />
    </HorizontalLayoutContainer>
  );
}

export default UserPasswordAuthField;
