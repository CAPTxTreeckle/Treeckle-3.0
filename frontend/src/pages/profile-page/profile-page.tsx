import { useEffect } from "react";
import { useParams } from "react-router-dom";

import PlaceholderWrapper from "../../components/placeholder-wrapper";
import UserProfileCard from "../../components/user-profile-card";
import { useGetSingleUser } from "../../custom-hooks/api/users-api";
import useScrollToTop from "../../custom-hooks/use-scroll-to-top";
import { useAppSelector } from "../../redux/hooks";
import { selectCurrentUserDisplayInfo } from "../../redux/slices/current-user-slice";

function ProfilePage() {
  const { userId } = useParams<{ userId: string }>();
  const { user, loading, getSingleUser } = useGetSingleUser();
  const currentUser = useAppSelector(selectCurrentUserDisplayInfo);

  useScrollToTop();

  useEffect(() => {
    getSingleUser(userId).catch((error) => console.error(error));
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
      {userData && <UserProfileCard {...userData} />}
    </PlaceholderWrapper>
  );
}

export default ProfilePage;
