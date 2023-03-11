import { CommentDatabase } from "../database/CommentDatabase";
import { PostDatabase } from "../database/PostDatabase";
import { UserDatabase } from "../database/UserDatabase";
import { CreateCommentInput, CreateCommentOutput, DeleteCommentInput, DeleteCommentOutput, GetCommentsByPostIdInput, GetCommentsByPostOutput } from "../dtos/userDTO";
import { BadRequestError } from "../error/BadRequestError";
import { Comment } from "../models/Comments";
import { HashManager } from "../services/HashManager";
import { IdGenerator } from "../services/IdGenerator";
import { TokenManager } from "../services/TokenManager";
import { CommentWithCreatorDB } from "../types";

export class CommentBusiness {
    constructor (
        private commentDatabase: CommentDatabase,
        private postDatabase: PostDatabase,
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

        const postDB = await this.postDatabase.findById(postId)

        if (!postDB) {
            throw new BadRequestError("Post não encontrado")
        }

        const commentsDB = await this.commentDatabase.getCommentsByPostId(postDB.id)

        if (commentsDB.length === 0) {
            throw new BadRequestError("Não existe comentário nesse post")
        }

        if (commentsDB.length === 0) {
            throw new BadRequestError("Não existe comentário nesse post")
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

    public createComment = async (input: CreateCommentInput): Promise<CreateCommentOutput> => {
        const {postId, content, token} = input

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

        if (typeof content !== "string") {
            throw new BadRequestError("'content' deve ser string")
        }

        const id = this.idGenerator.generate()
        const createdAt = new Date().toISOString();
        const creatorId = payload.id
        const creatorName = payload.name

        const comment = new Comment(
            id,
            postId,
            creatorId,
            0,
            0,
            createdAt,
            content,
            creatorName
        )

        const commentDB = comment.toDBModel()

        await this.commentDatabase.createComment(commentDB)

        const output: CreateCommentOutput = {
            message: "Comentário criado com sucesso"
        }

        return output
    }

    public deleteComment = async (input: DeleteCommentInput): Promise<DeleteCommentOutput> => {
        const {token, idToDelete} = input

        if (token === undefined) {
            throw new BadRequestError("token ausente")
        }
        
        const payload = this.tokenManager.getPayload(token)
        
        if (payload === null) {
            throw new BadRequestError("token inválido")
        }
        
        if (typeof idToDelete !== "string") {
            throw new BadRequestError("'idToDelete' deve ser string")
        }

        const commentDB = await this.commentDatabase.getCommentById(idToDelete)
        
        console.log(payload.id)
        console.log(commentDB.creator_id)

        if(!commentDB) {
            throw new BadRequestError("Comentário não encontrado")
        }

        if (commentDB.creator_id !== payload.id && !["ADMIN"].includes(payload.role)) {
            throw new BadRequestError("Somente o criador do comentário pode deletá-lo")
        }

        await this.commentDatabase.deleteCommentById(idToDelete)

        const output = {
            message: "Comentário deletado com sucesso"
        }

        return output
    }
}