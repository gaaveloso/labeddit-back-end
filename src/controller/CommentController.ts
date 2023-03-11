import { Request, Response } from "express"
import { CommentBusiness } from "../business/CommentBusiness";
import { CreateCommentInput } from "../dtos/userDTO";
import { BaseError } from "../error/BaseError";

export class CommentController {
    constructor (
        private commentBusiness: CommentBusiness
    ) {}

    public getComments = async (req: Request, res: Response) => {
        try {
            const input = {
                postId: req.params.id,
                token: req.headers.authorization
            }

            const output = await this.commentBusiness.getComments(input)

            res.status(200).send(output)

        } catch (error) {
            console.log(error)
            if (error instanceof BaseError) {
                res.status(error.statusCode).send(error.message)
            } else {
                res.status(500).send("Erro inesperado")
            }
        }
    }

    public createComment = async (req: Request, res: Response) => {
        try {
           const input: CreateCommentInput = {
                postId: req.params.id,
                content: req.body.content,
                token: req.headers.authorization
           }

           const output = await this.commentBusiness.createComment(input)

           res.status(201).send(output)

        } catch (error) {
            console.log(error)
            if (error instanceof BaseError) {
                res.status(error.statusCode).send(error.message)
            } else {
                res.status(500).send("Erro inesperado")
            }
        }
    }

    public deleteComment = async (req: Request, res: Response) => {
        try {
            const input = {
                idToDelete: req.params.id,
                token: req.headers.authorization
            }

            const output = await this.commentBusiness.deleteComment(input)

            res.status(200).send(output)

        } catch (error) {
            console.log(error)
            if (error instanceof BaseError) {
                res.status(error.statusCode).send(error.message)
            } else {
                res.status(500).send("Erro inesperado")
            }
        }
    }
}