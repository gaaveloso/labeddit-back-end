import { UserBusiness } from "../../src/business/UserBusiness"
import { SignupInput } from "../../src/dtos/userDTO"
import { BadRequestError } from "../../src/error/BadRequestError"
import { HashManagerMock } from "../mocks/HashManagerMock"
import { IdGeneratorMock } from "../mocks/IdGeneratorMock"
import { TokenManagerMock } from "../mocks/TokenManagerMock"
import { UserDatabaseMock } from "../mocks/UserDatabaseMock"

describe("signup", () => {
    const userBusiness = new UserBusiness(
        new UserDatabaseMock(),
        new IdGeneratorMock(),
        new TokenManagerMock(),
        new HashManagerMock()
    )

    test("cadastro bem-sucedido retorna token", async () => {
        const input: SignupInput = {
            email: "example@email.com",
            name: "Example Mock",
            password: "bananinha"
        }

        const response = await userBusiness.signup(input)
        expect(response.token).toBe("token-mock-normal")
    })

    test("Erro no signup NAME", async () => {
        expect.assertions(1)

        const input: SignupInput = {
            name: null,
            email: "normal@email.com",
            password: "hash-bananinha",
        }

        try {
            await userBusiness.signup(input)
        } catch (error) {
            if(error instanceof BadRequestError) {
                expect(error.message).toBe("'name' deve ser string")
            }
        }
    })

    test("Erro no signup EMAIL", async () => {
        expect.assertions(1)

        const input: SignupInput = {
            name: "Normal Mock",
            email: 5,
            password: "hash-bananinha",
        }

        try {
            await userBusiness.signup(input)
        } catch (error) {
            if(error instanceof BadRequestError) {
                expect(error.message).toBe("'email' deve ser string")
            }
        }
    })

    test("Erro no signup PASSWORD", async () => {
        expect.assertions(1)

        const input: SignupInput = {
            name: "Normal Mock",
            email: "normal@email.com",
            password: 123,
        }

        try {
            await userBusiness.signup(input)
        } catch (error) {
            if(error instanceof BadRequestError) {
                expect(error.message).toBe("'password' deve ser string")
            }
        }
    })

    test("Erro no signup EMAIL JA EXISTE", async () => {
        const input: SignupInput = {
            name: "Normal Mock",
            email: "normal@email.com",
            password: "hash-bananinha",
        }

        expect(async () => {
            await userBusiness.signup(input)
        }).rejects.toThrow("Endereço de email já existe")
    })
})