import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useGetSingleUser } from "../../custom-hooks/api/users-api";
import PlaceholderWrapper from "../../components/placeholder-wrapper";
import ProfileCard from "../../components/profile-card";
import { useAppSelector } from "../../redux/hooks";
import { selectCurrentUserDisplayInfo } from "../../redux/slices/current-user-slice";

function ProfilePage() {
  const { userId } = useParams<{ userId: string }>();
  const { user, loading, getSingleUser } = useGetSingleUser();
  const currentUser = useAppSelector(selectCurrentUserDisplayInfo);

  useEffect(() => {
    getSingleUser(userId);
  }, [getSingleUser, userId]);

  const userData = user?.isSelf && currentUser ? currentUser : user;

  return (
    <PlaceholderWrapper
      inverted
      loadingMessage="Retrieving profile"
      placeholder
      loading={loading}
      showDefaultMessage={!user}
      defaultMessage="No user found"
    >
      {userData && <ProfileCard {...userData} />}
    </PlaceholderWrapper>
  );
}

export default ProfilePage;
