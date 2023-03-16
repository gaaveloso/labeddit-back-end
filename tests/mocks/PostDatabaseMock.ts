import { BaseDatabase } from "../../src/database/BaseDatabase";
import {
  LikeDislikePostDB,
  PostDB,
  PostModel,
  PostWithCreatorDB,
  POST_LIKE,
} from "../../src/types";

export class PostDatabaseMock extends BaseDatabase {
  public static TABLE_POSTS = "posts";
  public static TABLE_LIKES_DISLIKES = "likes_dislikes";

  public getPostsWithCreators = async (): Promise<PostWithCreatorDB[]> => {
    return [
                {
                    id: 'id-mock',
                    content: 'Ouvindo uma musica relaxante',
                    likes: 0,
                    dislikes: 0,
                    created_at: new Date().toISOString(),
                    creator_name: 'Maria',
                    creator_id: 'id-mock'
                }
            ]
  };

  public insert = async (postDB: PostDB): Promise<void> => {};

  public findById = async (id: string): Promise<PostDB | undefined> => {
    
  };

  public delete = async (id: string): Promise<void> => {};

  public update = async (id: string, postDB: PostDB): Promise<void> => {};

  public findPostWithCreatorById = async (postId: string) => {};

  public likeOrDislikePost = async (
    likeDislike: LikeDislikePostDB
  ): Promise<void> => {};

  public findLikeOrDislikePost = async (
    likeDislikeDBToFind: LikeDislikePostDB
  ) => {};

  public removeLikeDislike = async (
    likeDislikeDB: LikeDislikePostDB
  ): Promise<void> => {};

  public updateLikeDislike = async (likeDislikeDB: LikeDislikePostDB) => {};

}
