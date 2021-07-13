import { useEffect, useState } from "react";
import { Button, Grid, Icon } from "semantic-ui-react";
import { useGetSelf } from "../../custom-hooks/api/users-api";
import PlaceholderWrapper from "../placeholder-wrapper";
import LinkGoogleAccountButton from "../link-google-account-button";
import UserSetPasswordField from "../user-set-password-field";
import HorizontalLayoutContainer from "../horizontal-layout-container";
import { SelfData } from "../../types/users";
import styles from "./user-auth-section.module.scss";

function UserAuthSection() {
  const { getSelf, loading } = useGetSelf();
  const [self, setSelf] = useState<SelfData>();

  useEffect(() => {
    (async () => {
      const self = await getSelf();
      setSelf(self);
    })();
  }, [getSelf]);

  return (
    <>
      <h3>Sign-in Methods</h3>
      <PlaceholderWrapper
        showDefaultMessage={!self}
        defaultMessage="Error loading sign-in methods"
        loading={loading}
        size="medium"
      >
        {self && (
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
                <UserSetPasswordField
                  extraContent={
                    <span
                      className={
                        self.hasPasswordAuth ? styles.greenText : styles.redText
                      }
                    >
                      {self.hasPasswordAuth ? "Active" : "Inactive"}
                    </span>
                  }
                  buttonText={self.hasPasswordAuth ? "Change" : "Activate"}
                  didUpdatedSelf={setSelf}
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
                <HorizontalLayoutContainer align="center">
                  <span
                    className={
                      self.hasGoogleAuth ? styles.greenText : styles.redText
                    }
                  >
                    {self.hasGoogleAuth ? "Linked" : "Not linked"}
                  </span>
                  {!self.hasGoogleAuth && (
                    <LinkGoogleAccountButton email={self.email} />
                  )}
                </HorizontalLayoutContainer>
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
                <HorizontalLayoutContainer align="center">
                  <span
                    className={
                      self.hasFacebookAuth ? styles.greenText : styles.redText
                    }
                  >
                    {self.hasFacebookAuth ? "Linked" : "Not linked"}
                  </span>
                  {!self.hasFacebookAuth && (
                    <Button
                      size="mini"
                      compact
                      color="blue"
                      content="Link"
                      disabled
                    />
                  )}
                </HorizontalLayoutContainer>
              </Grid.Column>
            </Grid.Row>
          </Grid>
        )}
      </PlaceholderWrapper>
    </>
  );
}

export default UserAuthSection;
