import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useGetSingleUser } from "../../../custom-hooks/api/users-api";
import PlaceholderWrapper from "../../placeholder-wrapper";
import ProfileCard from "../../profile-card";

function ProfilePage() {
  const { userId } = useParams<{ userId: string }>();
  const { user, loading, getSingleUser } = useGetSingleUser();

  useEffect(() => {
    getSingleUser(userId);
  }, [getSingleUser, userId]);

  return (
    <PlaceholderWrapper
      inverted
      loadingMessage="Retrieving profile"
      placeholder
      loading={loading}
      showDefaultMessage={!user}
      defaultMessage="No user found"
    >
      {user && <ProfileCard {...user} />}
    </PlaceholderWrapper>
  );
}

export default ProfilePage;
