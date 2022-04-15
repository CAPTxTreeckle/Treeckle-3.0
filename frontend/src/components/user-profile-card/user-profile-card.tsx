import { capitalCase } from "change-case";
import clsx from "clsx";
import { Divider, Grid, Image, Segment } from "semantic-ui-react";

import defaultAvatarImage from "../../assets/avatar.png";
import { UserData } from "../../types/users";
import { displayDateTime } from "../../utils/transform-utils";
import UserAuthSection from "../user-auth-section";
import UserNameChanger from "../user-name-changer";
import UserProfileImageChanger from "../user-profile-image-changer";
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
  const profileImageDisplay = (
    <Image
      circular
      src={profileImage || defaultAvatarImage}
      className={clsx(isSelf && "pointer")}
      bordered
      alt=""
      centered
      fluid
    />
  );
  const nameLabel = <h2>{name}</h2>;

  return (
    <Segment className={styles.userProfileCard} raised padded>
      <Grid columns="2" relaxed="very" padded stackable doubling>
        <Grid.Column width="6" verticalAlign="middle">
          {isSelf ? (
            <UserProfileImageChanger>
              {profileImageDisplay}
            </UserProfileImageChanger>
          ) : (
            profileImageDisplay
          )}
        </Grid.Column>
        <Grid.Column width="10">
          {isSelf ? <UserNameChanger>{nameLabel}</UserNameChanger> : nameLabel}

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
