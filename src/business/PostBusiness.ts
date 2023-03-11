import { PostDatabase } from "../database/PostDatabase";
import { CreatePostInput, DeletePostInput, EditPostInput, GetPostsInput, GetPostsOuput, LikeOrDislikePostInput } from "../dtos/userDTO";
import { BadRequestError } from "../error/BadRequestError";
import { NotFoundError } from "../error/NotFoundError";
import { Post } from "../models/Post";
import { HashManager } from "../services/HashManager";
import { IdGenerator } from "../services/IdGenerator";
import { TokenManager } from "../services/TokenManager";
import { LikeDislikePostDB, PostWithCreatorDB, POST_LIKE, USER_ROLES } from "../types";

export class PostBusiness {
    constructor(
        private postDatabase: PostDatabase,
        private idGenerator: IdGenerator,
        private tokenManager: TokenManager,
        private hashManager: HashManager
    ) {}

    public getPosts = async (input: GetPostsInput): Promise<GetPostsOuput> => {
        const {  token } = input
        
        if (token === undefined) {
            throw new BadRequestError("token ausente")
        }

        const payload = this.tokenManager.getPayload(token)

        if (payload === null) {
            throw new BadRequestError("token inválido")
        }

        const postWithCreatorsDB: PostWithCreatorDB[] = await this.postDatabase.getPostsWithCreators()


        const posts = postWithCreatorsDB.map((postDB) => {
            const post = new Post (
                postDB.id,
                postDB.content,
                postDB.likes,
                postDB.dislikes,
                postDB.created_at,
                postDB.creator_id,
                postDB.creator_name
            )

            return post.toBusinessModel()
        })


        return posts
    }

    public createPost = async (input: CreatePostInput): Promise<void> => {
        const { token, content } = input;

        if(!token) {
            throw new BadRequestError("'token' ausente")
        }

        const payload = this.tokenManager.getPayload(token);

        if (!payload) {
          throw new BadRequestError("'token' invalido");
        }
    
        if (typeof content !== "string") {
          throw new BadRequestError("'content' deve ser string");
        }

        if(content.length === 0) {
            throw new BadRequestError("'post' não pode ser vazio")
        }

        const id = this.idGenerator.generate()
        const createdAt = new Date().toISOString();
        const creatorId = payload.id
        const creatorName = payload.name

        const post = new Post(
            id,
            content,
            0,
            0,
            createdAt,
            creatorId,
            creatorName
        )

        const postDB = post.toDBModel()

        await this.postDatabase.insert(postDB)
    }

    public deletePost = async (input: DeletePostInput): Promise<void> => {
        const { token, idToDelete } = input

        if (!token) {
            throw new BadRequestError("'token' ausente");
          }
      
          const payload = this.tokenManager.getPayload(token);
      
          if (!payload) {
            throw new BadRequestError("'token' invalido");
          }
      
          const postDB = await this.postDatabase.findById(idToDelete);
      
          if (!postDB) {
            throw new NotFoundError("'id' não encontrado");
          }
      
          const creatorId = payload.id;
      
          if (payload.role !== USER_ROLES.ADMIN && postDB.creator_id !== creatorId) {
            throw new BadRequestError("somente quem criou o post pode deletá-la");
          }
      
          await this.postDatabase.delete(idToDelete);
    }

    public likeOrDislikePost = async (
        input: LikeOrDislikePostInput
      ): Promise<void> => {
        const { token, idToLikeOrDislike, like } = input;
    
        if (!token) {
          throw new BadRequestError("'token' ausente");
        }
    
        const payload = this.tokenManager.getPayload(token);
    
        if (!payload) {
          throw new BadRequestError("'token' invalido");
        }
    
        if (typeof like !== "boolean") {
          throw new BadRequestError("'like' deve ser boolean");
        }
    
        const postWithCreatorDB = await this.postDatabase.findPostWithCreatorById(
          idToLikeOrDislike
        );
    
        if (!postWithCreatorDB) {
          throw new NotFoundError("'id' não encontrado");
        }
    
        const userId = payload.id;
        const likeSQLITE = like ? 1 : 0;
    
        const likeDislikeDB: LikeDislikePostDB = {
          user_id: userId,
          post_id: postWithCreatorDB.id,
          like: likeSQLITE,
        };
    
        const post = new Post(
          postWithCreatorDB.id,
          postWithCreatorDB.content,
          postWithCreatorDB.likes,
          postWithCreatorDB.dislikes,
          postWithCreatorDB.created_at,
          postWithCreatorDB.creator_id,
          postWithCreatorDB.creator_name
        );
        
        const likeDislikeExists = await this.postDatabase.findOrDislikePost(likeDislikeDB)
    
        if (likeDislikeExists === POST_LIKE.ALREADY_LIKED) {
          if (like) {
            await this.postDatabase.removeLikeDislike(likeDislikeDB)
            post.removeLike()
          } else {
            await this.postDatabase.updateLikeDislike(likeDislikeDB)
            post.removeLike()
            post.addDislike()
          }
    
        } else if (likeDislikeExists === POST_LIKE.ALREADY_DISLIKED) {
          if (like) {
            await this.postDatabase.updateLikeDislike(likeDislikeDB)
            post.removeLike()
            post.addLike()
          } else {
            await this.postDatabase.removeLikeDislike(likeDislikeDB)
            post.removeDislike()
          }
    
        } else {
          await this.postDatabase.likeOrDislikePost(likeDislikeDB);
      
          like ? post.addLike() : post.addDislike()
      
        }
        
        const updatedPost = post.toDBModel()
    
        await this.postDatabase.update(idToLikeOrDislike, updatedPost)
    
    };
}