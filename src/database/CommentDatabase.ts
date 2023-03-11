import { CommentDB, CommentWithCreatorDB } from "../types";
import { BaseDatabase } from "./BaseDatabase";

export class CommentDatabase extends BaseDatabase {
  public static TABLE_COMMENTS = "comments";
  public static TABLE_LIKES_DISLIKES_COMMENTS = "comments_likes_dislikes";

  public getCommentWithCreatorByPostId = async (post_id: string) => {
    const result: CommentWithCreatorDB[] = await BaseDatabase.connection(
      CommentDatabase.TABLE_COMMENTS
    )
      .select(
        "comments.id",
        "comments.post_id",
        "comments.creator_id",
        "comments.likes",
        "comments.dislikes",
        "comments.created_at",
        "comments.content",
        "users.name AS creator_name"
      )
      .join("users", "comments.creator_id", "=", "users.id")
      .where({ post_id });

    return result;
  };

  public getCommentById = async (id: string) => {
    const commentDB: CommentWithCreatorDB[] = await BaseDatabase.connection(
      CommentDatabase.TABLE_COMMENTS
    )
      .select()
      .where({ id });

    return commentDB[0];
  };

  public createComment = async (comment: CommentDB) => {
    await BaseDatabase.connection(CommentDatabase.TABLE_COMMENTS).insert(
      comment
    );
  };

  public deleteCommentById = async (id: string) => {
    await BaseDatabase.connection(CommentDatabase.TABLE_COMMENTS)
      .delete()
      .where({ id });
  };

  public getCommentsByPostId = async (postId: string): Promise<CommentDB[]> => {
    const result: CommentDB[] = await BaseDatabase
      .connection(CommentDatabase.TABLE_COMMENTS)
      .select("*")
      .where({ post_id: postId });

    return result;
  }
}
