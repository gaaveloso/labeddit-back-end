import { CommentDB, CommentWithCreatorDB, COMMENT_LIKE, LikeDislikeCommentDB, LikeDislikePostDB } from "../types";
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

  public getIdPostByCommentId = async (id: string) => {
    const result = await BaseDatabase
        .connection(CommentDatabase.TABLE_COMMENTS)
        .select(
            "comments.post_id"
        )
        .where({ id })

    return result
  }

  public updateComment = async (id: string, commentDB: CommentDB) => {
    await BaseDatabase.connection(CommentDatabase.TABLE_COMMENTS)
    .update(commentDB)
    .where({ id })
  }

  public findLikeDislike = async (idToLikeOrDislike: LikeDislikeCommentDB): Promise<COMMENT_LIKE | null> => {
    const [likeDislikeDB]: LikeDislikePostDB[] = await BaseDatabase
        .connection(CommentDatabase.TABLE_LIKES_DISLIKES_COMMENTS)
        .select()
        .where({
            user_id: idToLikeOrDislike.user_id,
            comment_id: idToLikeOrDislike.comment_id
        })

        if (likeDislikeDB) {
            return likeDislikeDB.like === 1 ? COMMENT_LIKE.ALREADY_LIKED : COMMENT_LIKE.ALREADY_DISLIKED
        } else {
            return null
        }
  }

  public removeLikeDislike = async (idToLikeOrDislike: LikeDislikeCommentDB): Promise<void> => {
    await BaseDatabase
        .connection(CommentDatabase.TABLE_LIKES_DISLIKES_COMMENTS)
        .delete()
        .where({
            user_id: idToLikeOrDislike.user_id,
            comment_id: idToLikeOrDislike.comment_id
        })
  }

  public addLikeDislike = async (idToLikeOrDislike: LikeDislikeCommentDB): Promise<void> => {
    await BaseDatabase
    .connection(CommentDatabase.TABLE_LIKES_DISLIKES_COMMENTS)
    .update(idToLikeOrDislike)
    .where({
        user_id: idToLikeOrDislike.user_id,
        comment_id: idToLikeOrDislike.comment_id
    })
  }

  public likeOrDislikeComment = async (likeDislike: LikeDislikeCommentDB): Promise<void> => {
    await BaseDatabase.connection(CommentDatabase.TABLE_LIKES_DISLIKES_COMMENTS)
    .insert(likeDislike)
  }
}
