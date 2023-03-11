import { UserDatabase } from "../database/UserDatabase";
import { GetUsersInput, GetUsersOutput, LoginInput, LoginOutput, SignupInput, SignupOutput } from "../dtos/userDTO";
import { BadRequestError } from "../error/BadRequestError";
import { NotFoundError } from "../error/NotFoundError";
import { User } from "../models/User";
import { HashManager } from "../services/HashManager";
import { IdGenerator } from "../services/IdGenerator";
import { TokenManager } from "../services/TokenManager";
import { TokenPayload, UserDB, USER_ROLES } from "../types";

export class UserBusiness {
  constructor(
    private userDatabase: UserDatabase,
    private idGenerator: IdGenerator,
    private tokenManager: TokenManager,
    private hashManager: HashManager
  ) {}

  public getUsers = async (input: GetUsersInput): Promise<GetUsersOutput> => {
    const { q, token } = input;

    if (!token) {
      throw new BadRequestError("Token não enviado");
    }

    const payload = this.tokenManager.getPayload(token as string);

    if (payload === null) {
      throw new BadRequestError("Token Inválido");
    }

    if (payload.role !== USER_ROLES.ADMIN) {
      throw new BadRequestError("Usuario não autorizado");
    }

    if (typeof q !== "string" && q !== undefined) {
      throw new BadRequestError("'q' deve ser string ou undefined");
    }

    const usersDB = await this.userDatabase.findUsers(q);

    const users = usersDB.map((userDB) => {
        const user = new User(
          userDB.id,
          userDB.name,
          userDB.email,
          userDB.password,
          userDB.role,
          userDB.created_at
        );
  
        return user.toBusinessModel();
      });
  
      const output: GetUsersOutput = users;
  
      return output;
  };

  public signup = async (input: SignupInput): Promise<SignupOutput> => {
    const { name, email, password } = input

    if (typeof name !== "string") {
        throw new BadRequestError("'name' deve ser string")
      }
  
      if (typeof email !== "string") {
        throw new BadRequestError("'email' deve ser string")
      }
  
      if (typeof password !== "string") {
        throw new BadRequestError("'password' deve ser string")
      }
  
      if (name.length < 3) {
        throw new BadRequestError("'name' deve possuir no mínimo 3 caracteres")
      }
  
      if (email.length < 3 || !email.includes("@")) {
        throw new BadRequestError("'email' deve possuir no mínimo 3 caracteres e ter @")
      }
  
      if (password.length < 3) {
        throw new BadRequestError("'password' deve possuir no mínimo 3 caracteres")
      }

      const existingUser = await this.userDatabase.findByEmail(email);
      if (existingUser) {
        throw new BadRequestError("Endereço de email já existe");
      }

      const id = this.idGenerator.generate()
      const hashedPassword = await this.hashManager.hash(password)
      const role = USER_ROLES.NORMAL
      const createdAt = new Date().toISOString()

      const newUser = new User(
        id,
        name,
        email,
        hashedPassword,
        role,
        createdAt
      )

      const userDB = newUser.toDBModel()

      await this.userDatabase.insert(userDB)

      const payload: TokenPayload = {
        id: newUser.getId(),
        name: newUser.getName(),
        role: newUser.getRole()
      }
  
      const token = this.tokenManager.createToken(payload)
  
      const output: SignupOutput = {
        message: "Usuario criado com sucesso",
        token
      }
  
      return output
  }

  public login = async (input: LoginInput): Promise<LoginOutput> => {
    const { email, password } = input

    if (typeof email !== "string") {
      throw new BadRequestError("'email' deve ser string")
    }

    if (typeof password !== "string") {
      throw new BadRequestError("'password' deve ser string")
    }

    const userDB: UserDB | undefined = await this.userDatabase.findByEmail(email)

    console.log(userDB)

    if (!userDB) {
      throw new NotFoundError("'email' não cadastrado")
    }

    const user = new User(
      userDB.id,
      userDB.name,
      userDB.email,
      userDB.password,
      userDB.role,
      userDB.created_at
    )

    const hashedPassword = user.getPassword()

    const isPasswordCorrect = await this.hashManager
      .compare(password, hashedPassword)

    if (!isPasswordCorrect) {
      throw new BadRequestError("'password' incorreto")
    }

    const payload: TokenPayload = {
      id: user.getId(),
      name: user.getName(),
      role: user.getRole()
    }

    const token = this.tokenManager.createToken(payload)

    const output: LoginOutput = {
        message: "Login realizado",
        token
    }

    return output
  }
}
