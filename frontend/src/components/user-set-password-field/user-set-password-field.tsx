import { useState, ReactNode, useRef, FormEvent } from "react";
import { toast } from "react-toastify";
import { Button, Icon, Input } from "semantic-ui-react";
import { useUpdateSelf } from "../../custom-hooks/api/users-api";
import { SelfData } from "../../types/users";
import { resolveApiError } from "../../utils/error-utils";
import HorizontalLayoutContainer from "../horizontal-layout-container";
import styles from "./user-set-password-field.module.scss";

type Props = {
  extraContent: ReactNode;
  buttonText: string;
  didUpdatedSelf?: (self: SelfData) => void;
};

function UserSetPasswordField({
  extraContent,
  buttonText,
  didUpdatedSelf,
}: Props) {
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

      didUpdatedSelf?.(updatedSelf);
      setSettingPassword(false);
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
      {extraContent}
      <Button
        onClick={() => setSettingPassword(true)}
        size="mini"
        compact
        color="blue"
        content={buttonText}
      />
    </HorizontalLayoutContainer>
  );
}

export default UserSetPasswordField;
