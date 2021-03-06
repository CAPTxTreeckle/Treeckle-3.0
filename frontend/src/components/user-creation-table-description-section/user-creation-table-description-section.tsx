import { capitalCase } from "change-case";
import { Grid, Icon, Message, Segment } from "semantic-ui-react";

import {
  USER_CREATION_STATUS_DETAILS,
  USER_CREATION_STATUSES,
} from "../../types/users";
import styles from "./user-creation-table-description-section.module.scss";

function UserCreationTableDescriptionSection() {
  return (
    <Segment raised>
      <Message info icon>
        <Icon name="info circle" />
        <Message.Content>
          <p>This section contains the parsed users&apos; details.</p>
          <p>There are 4 types of user statuses:</p>
          <Grid
            verticalAlign="middle"
            padded="vertically"
            columns="2"
            stackable
          >
            {USER_CREATION_STATUSES.map((status) => {
              const { description, classType } =
                USER_CREATION_STATUS_DETAILS.get(status) ?? {};

              return (
                <Grid.Row className={styles.statusRow} key={status}>
                  <Grid.Column textAlign="center" width="3">
                    <Message
                      size="mini"
                      className={styles.status}
                      content={capitalCase(status)}
                      positive={classType === "positive"}
                      negative={classType === "negative"}
                      warning={classType === "warning"}
                    />
                  </Grid.Column>
                  <Grid.Column width="13">
                    <p>{description}</p>
                  </Grid.Column>
                </Grid.Row>
              );
            })}
          </Grid>
          <p>
            <strong>Note:</strong> Only users with <strong>New</strong> status
            will be submitted for creation. Entries with other statuses will be
            ignored.
          </p>
        </Message.Content>
      </Message>
    </Segment>
  );
}

export default UserCreationTableDescriptionSection;
