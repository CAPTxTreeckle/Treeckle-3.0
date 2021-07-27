import { capitalCase } from "change-case";
import { Grid, Segment, Image, Divider } from "semantic-ui-react";
import { displayDateTime } from "../../utils/parser-utils";
import { UserData } from "../../types/users";
import UserAuthSection from "../user-auth-section";
import UserNameChanger from "../user-name-changer";
import defaultAvatarImage from "../../assets/avatar.png";
import styles from "./user-profile-card.module.scss";

type Props = UserData;

function UserProfileCard({
  profileImage,
  name,
  email,
  organization,
  role,
  createdAt,
  isSelf,
}: Props) {
  return (
    <Segment className={styles.userProfileCard} raised padded>
      <Grid columns="2" relaxed="very" padded stackable doubling>
        <Grid.Column width="6" verticalAlign="middle">
          <Image
            src={profileImage || defaultAvatarImage}
            className={styles.avatar}
            bordered
            alt=""
            centered
            fluid
          />
        </Grid.Column>
        <Grid.Column width="10">
          {isSelf ? (
            <UserNameChanger>
              <h2>{name}</h2>
            </UserNameChanger>
          ) : (
            <h2>{name}</h2>
          )}

          <Divider hidden />

          <p>
            <strong>Email:</strong> <a href={`mailto:${email}`}>{email}</a>
          </p>
          <p>
            <strong>Organization:</strong> {organization}
          </p>
          <p>
            <strong>Role:</strong> {capitalCase(role)}
          </p>
          <p>
            <strong>Joined in:</strong>{" "}
            {displayDateTime(createdAt, "MMMM yyyy")}
          </p>

          <Divider hidden />

          {isSelf && <UserAuthSection />}
        </Grid.Column>
      </Grid>
    </Segment>
  );
}

export default UserProfileCard;
