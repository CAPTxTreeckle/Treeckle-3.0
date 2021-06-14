import { Grid, Segment, Image, Divider } from "semantic-ui-react";
import { displayDateTime } from "../../utils/parser-utils";
import { UserData } from "../../types/users";
import defaultAvatarImage from "../../assets/avatar.png";
import styles from "./profile-card.module.scss";

type Props = UserData;

function ProfileCard({
  profileImage,
  name,
  email,
  organization,
  role,
  createdAt,
}: Props) {
  return (
    <Segment className={styles.profileCard} raised padded="very">
      <Grid columns="2" relaxed="very" stackable>
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
          <h2>{name}</h2>

          <Divider hidden />

          <p>
            <strong className={styles.label}>Email:</strong>
            <span>{email}</span>
          </p>
          <p>
            <strong className={styles.label}>Organization:</strong>
            <span>{organization}</span>
          </p>
          <p>
            <strong className={styles.label}>Role:</strong>
            <span className={styles.role}>{role?.toLowerCase() ?? role}</span>
          </p>
          <p>
            <strong className={styles.label}>Joined in:</strong>
            <span>{displayDateTime(createdAt, "MMMM yyyy")}</span>
          </p>
        </Grid.Column>
      </Grid>
    </Segment>
  );
}

export default ProfileCard;
