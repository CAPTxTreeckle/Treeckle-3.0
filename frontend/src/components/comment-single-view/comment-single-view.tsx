import { Comment } from "semantic-ui-react";
import { CommentData } from "../../types/comments";
import { displayDateTime } from "../../utils/parser-utils";
import defaultAvatarImage from "../../assets/avatar.png";

type Props = {
  comment: CommentData;
};

function CommentSingleView({
  comment: {
    id,
    commenter: { name, profileImage },
    content,
    isActive,
    createdAt,
    updatedAt,
  },
}: Props) {
  function getDateTimeDetails(createdAt: number, updatedAt: number) {
    const date_time = displayDateTime(createdAt);

    if (createdAt === updatedAt) {
      return date_time;
    }

    return `${date_time} (Edited)`;
  }

  return (
    <Comment key={id}>
      <Comment.Avatar circular src={profileImage || defaultAvatarImage} />
      <Comment.Content>
        <div>
          <Comment.Author>{name}</Comment.Author>
          <Comment.Metadata>
            {getDateTimeDetails(createdAt, updatedAt)}
          </Comment.Metadata>
        </div>

        <Comment.Text>{content}</Comment.Text>
        <Comment.Actions>
          <Comment.Action>Reply</Comment.Action>
        </Comment.Actions>
      </Comment.Content>
    </Comment>
  );
}

export default CommentSingleView;
