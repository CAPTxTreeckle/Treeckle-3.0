import { FormEvent, ReactNode, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { Button, Input, Popup } from "semantic-ui-react";

import { useUpdateSelf } from "../../custom-hooks/api/users-api";
import { useAppSelector } from "../../redux/hooks";
import {
  selectCurrentUserDisplayInfo,
  updateCurrentUserAction,
} from "../../redux/slices/current-user-slice";
import { SelfPatchAction } from "../../types/users";
import { ApiResponseError, resolveApiError } from "../../utils/error-utils";
import HorizontalLayoutContainer from "../horizontal-layout-container";

type Props = {
  children?: ReactNode;
};

function UserNameChanger({ children }: Props) {
  const { name } = useAppSelector(selectCurrentUserDisplayInfo) ?? {};
  const dispatch = useDispatch();
  const [isChangingName, setChangingName] = useState(false);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const { loading, updateSelf } = useUpdateSelf();

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const newName = nameInputRef.current?.value.trim();

    if (!newName || loading) {
      return;
    }

    if (newName === name) {
      setChangingName(false);
      return;
    }

    try {
      const updatedSelf = await updateSelf({
        action: SelfPatchAction.Name,
        payload: { name: newName },
      });

      if (updatedSelf.isSelf) {
        dispatch(updateCurrentUserAction({ user: updatedSelf }));
        setChangingName(false);

        toast.success("Your name has been updated successfully.");
      }
    } catch (error) {
      resolveApiError(error as ApiResponseError);
    }
  };

  return isChangingName ? (
    <form
      onSubmit={(e) => {
        onSubmit(e).catch((error) => console.error(error));
      }}
    >
      <HorizontalLayoutContainer>
        <Input
          size="small"
          action={
            <Button
              loading={loading}
              disabled={loading}
              type="submit"
              icon="check"
              color="green"
              size="small"
            />
          }
          input={{ ref: nameInputRef, defaultValue: name }}
          required
        />

        <Button
          type="button"
          color="red"
          icon="times"
          onClick={() => setChangingName(false)}
          size="small"
        />
      </HorizontalLayoutContainer>
    </form>
  ) : (
    <HorizontalLayoutContainer align="center">
      <span>{children}</span>

      <Popup
        content="Change"
        position="top center"
        size="small"
        trigger={
          <Button
            onClick={() => setChangingName(true)}
            size="tiny"
            compact
            color="blue"
            icon="edit"
          />
        }
      />
    </HorizontalLayoutContainer>
  );
}

export default UserNameChanger;
