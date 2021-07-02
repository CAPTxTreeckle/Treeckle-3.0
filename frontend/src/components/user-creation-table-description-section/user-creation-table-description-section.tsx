import { Segment, Message, Icon, Grid } from "semantic-ui-react";
import { capitalCase } from "change-case";
import {
  userCreationStatuses,
  USER_CREATION_STATUS_DETAILS,
} from "../../types/users";
import styles from "./user-creation-table-description-section.module.scss";

function UserCreationTableDescriptionSection() {
  return (
    <Segment raised>
      <Message info icon>
        <Icon name="info circle" />
        <Message.Content>
          <p>This section contains the parsed users' details.</p>
          <p>There are 4 types of user statuses:</p>
          <Grid
            verticalAlign="middle"
            padded="vertically"
            columns="2"
            stackable
          >
            {userCreationStatuses.map((status) => {
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
