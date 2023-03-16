import {
  LikeDislikePostDB,
  PostDB,
  PostWithCreatorDB,
  POST_LIKE,
} from "../types";
import { BaseDatabase } from "./BaseDatabase";

export class PostDatabase extends BaseDatabase {
  public static TABLE_POSTS = "posts";
  public static TABLE_LIKE_DISLIKE_POST = "posts_likes_dislikes";
  public static TABLE_USERS = "users";

  public getPostsWithCreators = async () => {
    const result: PostWithCreatorDB[] = await BaseDatabase.connection(
      PostDatabase.TABLE_POSTS
    )
      .select(
        "posts.id",
        "posts.creator_id",
        "posts.content",
        "posts.likes",
        "posts.dislikes",
        "posts.comments",
        "posts.created_at",
        "users.name AS creator_name"
      )
      .join("users", "posts.creator_id", "=", "users.id");

    return result;
  };

  public insert = async (postDB: PostDB): Promise<void> => {
    await BaseDatabase.connection(PostDatabase.TABLE_POSTS).insert(postDB);
  };

  public findById = async (id: string): Promise<PostDB | undefined> => {
    const result: PostDB[] = await BaseDatabase.connection(
      PostDatabase.TABLE_POSTS
    )
      .select()
      .where({ id });

    return result[0];
  };

  public delete = async (id: string): Promise<void> => {
    await BaseDatabase.connection(PostDatabase.TABLE_POSTS)
      .delete()
      .where({ id });
  };

  public update = async (id: string, postDB: PostDB): Promise<void> => {
    await BaseDatabase.connection(PostDatabase.TABLE_POSTS)
      .update(postDB)
      .where({ id });
  };
  
  public findPostWithCreatorById = async (
    postId: string
  ): Promise<PostWithCreatorDB | undefined> => {
    const result: PostWithCreatorDB[] = await BaseDatabase.connection(
      PostDatabase.TABLE_POSTS
    )
      .select(
        "posts.id",
        "posts.creator_id",
        "posts.content",
        "posts.likes",
        "posts.dislikes",
        "posts.created_at",
        "users.name AS creator_name"
      )
      .join("users", "posts.creator_id", "=", "users.id")
      .where("posts.id", postId);

    return result[0];
  };

  public likeOrDislikePost = async (
    likeDislike: LikeDislikePostDB
  ): Promise<void> => {
    await BaseDatabase.connection(PostDatabase.TABLE_LIKE_DISLIKE_POST).insert(
      likeDislike
    );
  };

  public findLikeOrDislikePost = async (
    likeDislikeDBToFind: LikeDislikePostDB
  ): Promise<POST_LIKE | null> => {
    const [likeDislikeDB]: LikeDislikePostDB[] = await BaseDatabase.connection(
      PostDatabase.TABLE_LIKE_DISLIKE_POST
    )
      .select()
      .where({
        user_id: likeDislikeDBToFind.user_id,
        post_id: likeDislikeDBToFind.post_id,
      });

    if (likeDislikeDB) {
      return likeDislikeDB.like === 1
        ? POST_LIKE.ALREADY_LIKED
        : POST_LIKE.ALREADY_DISLIKED;
    } else {
      return null;
    }
  };

  public removeLikeDislike = async (
    likeDislikeDB: LikeDislikePostDB
  ): Promise<void> => {
    await BaseDatabase.connection(PostDatabase.TABLE_LIKE_DISLIKE_POST)
      .delete()
      .where({
        user_id: likeDislikeDB.user_id,
        post_id: likeDislikeDB.post_id,
      });
  };

  public updateLikeDislike = async (likeDislikeDB: LikeDislikePostDB) => {
    await BaseDatabase.connection(PostDatabase.TABLE_LIKE_DISLIKE_POST)
      .update(likeDislikeDB)
      .where({
        user_id: likeDislikeDB.user_id,
        post_id: likeDislikeDB.post_id,
      });
  };
}
