import { useEffect, useState } from "react";
import { Grid, Icon } from "semantic-ui-react";

import { useGetSelf } from "../../custom-hooks/api/users-api";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import {
  selectCurrentUserDisplayInfo,
  updateCurrentUserAction,
} from "../../redux/slices/current-user-slice";
import PlaceholderWrapper from "../placeholder-wrapper";
import UserFacebookAuthField from "../user-facebook-auth-field";
import UserGoogleAuthField from "../user-google-auth-field";
import UserPasswordAuthField from "../user-password-auth-field";
import styles from "./user-auth-section.module.scss";

function UserAuthSection() {
  const { getSelf } = useGetSelf();
  // cannot use loading in useGetSelf since need to set loading to true initially
  const [loading, setLoading] = useState(true);
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectCurrentUserDisplayInfo);

  useEffect(() => {
    (async () => {
      const self = await getSelf();
      setLoading(false);
      if (!self) {
        return;
      }

      dispatch(updateCurrentUserAction({ user: self }));
    })();
  }, [getSelf, dispatch]);

  return (
    <>
      <h3>Sign-in Methods</h3>
      <PlaceholderWrapper
        showDefaultMessage={!user}
        defaultMessage="Error loading sign-in methods"
        loading={loading}
        size="medium"
      >
        <Grid
          className={styles.userAuthSection}
          verticalAlign="middle"
          columns="2"
          stackable
        >
          <Grid.Row>
            <Grid.Column
              mobile="5"
              tablet="5"
              computer="4"
              largeScreen="3"
              widescreen="2"
            >
              <Icon name="key" />
              <strong>Password:</strong>
            </Grid.Column>

            <Grid.Column
              mobile="11"
              tablet="11"
              computer="12"
              largeScreen="13"
              widescreen="14"
            >
              <UserPasswordAuthField>
                <span
                  className={
                    user?.hasPasswordAuth ? styles.greenText : styles.redText
                  }
                >
                  {user?.hasPasswordAuth ? "Active" : "Inactive"}
                </span>
              </UserPasswordAuthField>
            </Grid.Column>
          </Grid.Row>

          <Grid.Row>
            <Grid.Column
              mobile="5"
              tablet="5"
              computer="4"
              largeScreen="3"
              widescreen="2"
            >
              <Icon name="google" />
              <strong>Google:</strong>
            </Grid.Column>

            <Grid.Column
              mobile="11"
              tablet="11"
              computer="12"
              largeScreen="13"
              widescreen="14"
            >
              <UserGoogleAuthField>
                <span
                  className={
                    user?.googleAuth ? styles.greenText : styles.redText
                  }
                >
                  {user?.googleAuth ? "Linked" : "Not linked"}
                </span>
              </UserGoogleAuthField>
            </Grid.Column>
          </Grid.Row>

          <Grid.Row>
            <Grid.Column
              mobile="5"
              tablet="5"
              computer="4"
              largeScreen="3"
              widescreen="2"
            >
              <Icon name="facebook" />
              <strong>Facebook:</strong>
            </Grid.Column>

            <Grid.Column
              mobile="11"
              tablet="11"
              computer="12"
              largeScreen="13"
              widescreen="14"
            >
              <UserFacebookAuthField>
                <span
                  className={
                    user?.facebookAuth ? styles.greenText : styles.redText
                  }
                >
                  {user?.facebookAuth ? "Linked" : "Not linked"}
                </span>
              </UserFacebookAuthField>
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </PlaceholderWrapper>
    </>
  );
}

export default UserAuthSection;
