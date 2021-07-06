import clsx from "clsx";
import { Segment, Grid, Message, Icon } from "semantic-ui-react";
import UserCreationForm from "../user-creation-form";
import UserCreationCsvUploader from "../user-creation-csv-uploader";
import styles from "./user-creation-input-section.module.scss";

function UserCreationInputSection() {
  return (
    <Segment raised>
      <Grid centered stackable>
        <Grid.Row columns="1">
          <Grid.Column>
            <Message info icon>
              <Icon name="info circle" />
              <Message.Content>
                <p>
                  Type or paste in the emails, separated with{" "}
                  <strong>spaces</strong> or <strong>commas</strong>, to create
                  new users. Alternatively, you can upload a CSV file containing
                  the emails.
                </p>

                <p>
                  Currently, Treeckle supports both <strong>NUSNET</strong> and{" "}
                  <strong>Gmail</strong> users.
                </p>

                <p>
                  <strong>Note:</strong> For creation of NUSNET users, please
                  provide NUSNET emails and <strong>NOT</strong> friendly
                  emails.
                </p>
              </Message.Content>
            </Message>
          </Grid.Column>
        </Grid.Row>
        <Grid.Row
          className={clsx(styles.inputContainer, styles.important)}
          columns="2"
        >
          <Grid.Column className={styles.column}>
            <UserCreationForm />
          </Grid.Column>
          <Grid.Column className={styles.column}>
            <UserCreationCsvUploader />
          </Grid.Column>
        </Grid.Row>
      </Grid>
    </Segment>
  );
}

export default UserCreationInputSection;