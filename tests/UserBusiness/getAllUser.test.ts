import { UserBusiness } from "../../src/business/UserBusiness"
import { GetUsersInput } from "../../src/dtos/userDTO"
import { USER_ROLES } from "../../src/types"
import { HashManagerMock } from "../mocks/HashManagerMock"
import { IdGeneratorMock } from "../mocks/IdGeneratorMock"
import { TokenManagerMock } from "../mocks/TokenManagerMock"
import { UserDatabaseMock } from "../mocks/UserDatabaseMock"

describe("users", () => {
    const userBusiness = new UserBusiness(
        new UserDatabaseMock(),
        new IdGeneratorMock(),
        new TokenManagerMock(),
        new HashManagerMock()
    )

    test("deve retornar uma lista de Users", async () => {
        const input: GetUsersInput = {
            q: "id-mock",
            token: "token-mock-admin"
        }
        
        const response = await userBusiness.getUsers(input)
        
        expect(response).toHaveLength(2)
    })
})