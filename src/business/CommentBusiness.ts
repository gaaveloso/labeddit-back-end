import { CommentDatabase } from "../database/CommentDatabase";
import { UserDatabase } from "../database/UserDatabase";
import { GetCommentsByPostIdInput, GetCommentsByPostOutput } from "../dtos/userDTO";
import { BadRequestError } from "../error/BadRequestError";
import { Comment } from "../models/Comments";
import { HashManager } from "../services/HashManager";
import { IdGenerator } from "../services/IdGenerator";
import { TokenManager } from "../services/TokenManager";
import { CommentWithCreatorDB } from "../types";

export class CommentBusiness {
    constructor (
        private commentDatabase: CommentDatabase,
        private userDatabase: UserDatabase,
        private idGenerator: IdGenerator,
        private tokenManager: TokenManager,
        private hashManager: HashManager
    ) {}

    public getComments = async (input: GetCommentsByPostIdInput): Promise<GetCommentsByPostOutput> => {
        const { postId, token } = input

        if (token === undefined) {
            throw new BadRequestError("token ausente")
        }

        const payload = this.tokenManager.getPayload(token)

        if (payload === null) {
            throw new BadRequestError("token inválido")
        }

        if (typeof postId !== "string") {
            throw new BadRequestError("'postId' deve ser string")
        }

        const commentsWithCreatorDB: CommentWithCreatorDB[] = await this.commentDatabase.getCommentWithCreatorByPostId(postId)

        const comments = commentsWithCreatorDB.map((commentDB) => {
            const comment = new Comment(
                commentDB.id,
                commentDB.post_id,
                commentDB.creator_id,
                commentDB.likes,
                commentDB.dislikes,
                commentDB.created_at,
                commentDB.content,
                commentDB.creator_name
            )

            return comment.toBusinessModel()
        })

        return comments
    }
}