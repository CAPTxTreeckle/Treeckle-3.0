import { useEffect } from "react";
import { Grid, Icon } from "semantic-ui-react";
import { useGetSelf } from "../../custom-hooks/api/users-api";
import PlaceholderWrapper from "../placeholder-wrapper";
import UserPasswordAuthField from "../user-password-auth-field";
import UserGoogleAuthField from "../user-google-auth-field";
import UserFacebookAuthField from "../user-facebook-auth-field";
import styles from "./user-auth-section.module.scss";
import { useAppDispatch, useDeepEqualAppSelector } from "../../redux/hooks";
import {
  selectCurrentUserDisplayInfo,
  updateCurrentUserAction,
} from "../../redux/slices/current-user-slice";

function UserAuthSection() {
  const { getSelf, loading } = useGetSelf();
  const dispatch = useAppDispatch();
  const user = useDeepEqualAppSelector(selectCurrentUserDisplayInfo);

  useEffect(() => {
    (async () => {
      const self = await getSelf();
      if (!self) {
        return;
      }

      dispatch(updateCurrentUserAction({ user: self }));
    })();
  }, [getSelf, dispatch]);

  console.log("test");

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
              <UserPasswordAuthField
                labelClassName={
                  user?.hasPasswordAuth ? styles.greenText : styles.redText
                }
              />
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
              <UserGoogleAuthField
                labelClassName={
                  user?.hasGoogleAuth ? styles.greenText : styles.redText
                }
              />
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
              <UserFacebookAuthField
                labelClassName={
                  user?.hasFacebookAuth ? styles.greenText : styles.redText
                }
              />
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </PlaceholderWrapper>
    </>
  );
}

export default UserAuthSection;
