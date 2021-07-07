import { Comment, Header } from "semantic-ui-react";
import { CommentData } from "../../types/comments";
import CommentSingleView from "../comment-single-view";

type Props = {
  comments: CommentData[];
};

function CommentsView({ comments }: Props) {
  return (
    <Comment.Group>
      <Header as="h3" dividing>
        Comments
      </Header>
      {comments.map((comment) => {
        return <CommentSingleView comment={comment} />;
      })}
    </Comment.Group>
  );
}

export default CommentsView;
