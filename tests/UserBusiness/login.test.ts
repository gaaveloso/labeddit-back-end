import { UserBusiness } from "../../src/business/UserBusiness"
import { LoginInput } from "../../src/dtos/userDTO"
import { BadRequestError } from "../../src/error/BadRequestError"
import { HashManagerMock } from "../mocks/HashManagerMock"
import { IdGeneratorMock } from "../mocks/IdGeneratorMock"
import { TokenManagerMock } from "../mocks/TokenManagerMock"
import { UserDatabaseMock } from "../mocks/UserDatabaseMock"

describe("login", () => {
    const userBusiness = new UserBusiness(
        new UserDatabaseMock(),
        new IdGeneratorMock(),
        new TokenManagerMock(),
        new HashManagerMock()
    )

    test("login bem-sucedido em conta normal retorna token", async () => {
        const input: LoginInput = {
            email: "normal@email.com",
            password: "bananinha"
        }

        const response = await userBusiness.login(input)
        expect(response.token).toBe("token-mock-normal")
    })

    test("login bem-sucedido em conta admin retorna token", async () =>{
        const input: LoginInput = {
            email: "admin@email.com",
            password: "bananinha"
        }

        const response = await userBusiness.login(input)
        expect(response.token).toBe("token-mock-admin")
    })

    test("Erro no login EMAIL", async () => {
        expect.assertions(1)

        const input: LoginInput = {
            email: 5,
            password: "hash-bananinha"
        }

        try {
            await userBusiness.login(input)
        } catch (error) {
            if(error instanceof BadRequestError) {
                expect(error.message).toBe("'email' deve ser string")
            }
        }
    })

    test("Erro no password EMAIL", async () => {
        expect.assertions(1)

        const input: LoginInput = {
            email: "normal@email.com",
            password: 5
        }

        try {
            await userBusiness.login(input)
        } catch (error) {
            if(error instanceof BadRequestError) {
                expect(error.message).toBe("'password' deve ser string")
            }
        }
    })

    test("Erro no login EMAIL NÃO CADASTRADO", async () => {
        const input: LoginInput = {
            email: "normal22@email.com",
            password: "hash-bananinha",
        }

        expect(async () => {
            await userBusiness.login(input)
        }).rejects.toThrow("'email' não cadastrado")
    })

    test("Erro no login SENHA INCORRETA", async () => {
        const input: LoginInput = {
            email: "normal@email.com",
            password: "hash-bananinha123",
        }

        expect(async () => {
            await userBusiness.login(input)
        }).rejects.toThrow("'password' incorreto")
    })
})