import { useState, useRef, FormEvent, ReactNode } from "react";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { Button, Icon, Input, Popup } from "semantic-ui-react";
import { useUpdateSelf } from "../../custom-hooks/api/users-api";
import { useAppSelector } from "../../redux/hooks";
import {
  selectCurrentUserDisplayInfo,
  updateCurrentUserAction,
} from "../../redux/slices/current-user-slice";
import { SelfPatchAction } from "../../types/users";
import { resolveApiError } from "../../utils/error-utils";
import HorizontalLayoutContainer from "../horizontal-layout-container";
import styles from "./user-password-auth-field.module.scss";

type Props = {
  children?: ReactNode;
};

function UserPasswordAuthField({ children }: Props) {
  const { hasPasswordAuth } =
    useAppSelector(selectCurrentUserDisplayInfo) ?? {};
  const dispatch = useDispatch();
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
      const updatedSelf = await updateSelf({
        action: SelfPatchAction.Password,
        payload: { password },
      });

      if (updatedSelf.isSelf) {
        dispatch(updateCurrentUserAction({ user: updatedSelf }));
        setSettingPassword(false);
        setShowingPassword(false);

        toast.success("Your password has been updated successfully.");
      }
    } catch (error) {
      resolveApiError(error);
    }
  };

  return isSettingPassword ? (
    <form onSubmit={onSubmit}>
      <HorizontalLayoutContainer>
        <Input
          size="mini"
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
            size="tiny"
            type="submit"
            icon="check"
            color="green"
          />
        </Input>

        <Button
          size="tiny"
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
    <HorizontalLayoutContainer spacing="compact" align="center">
      {children}

      <Popup
        content={hasPasswordAuth ? "Change" : "Activate"}
        position="top center"
        size="small"
        trigger={
          <Button
            onClick={() => setSettingPassword(true)}
            size="mini"
            compact
            color="blue"
            icon="edit"
          />
        }
      />
    </HorizontalLayoutContainer>
  );
}

export default UserPasswordAuthField;
