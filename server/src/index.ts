import "reflect-metadata"; // ОБЯЗАТЕЛЬНО ПЕРВЫМ ИМПОРТОМ
import {ApolloServer} from "apollo-server";
import {buildSchema, AuthChecker} from "type-graphql";
import {TaskResolver} from "./resolvers/TaskResolver";
import {UserResolver} from "./resolvers/UserResolver";
import {AppDataSource} from "./data-source";
import "dotenv/config";
import { verify } from "jsonwebtoken";

export interface MyContext {
    userId?: number;
}
const customAuthChecker: AuthChecker<MyContext> = ({ context }) => {
    return !!context.userId;
};
async function main() {
    // 1. Настройка базы данных (TypeORM)
    await AppDataSource.initialize()
        .then(() => console.log("Data Source has been initialized!"))
        .catch((err) => { console.error("Error during Data Source initialization", err); process.exit(1); });

    // 2. Настройка GraphQL (Type-GraphQL + Apollo)
    // Нам нужен хотя бы один Resolver, чтобы сервер запустился.
    // Пока сделаем "заглушку" прямо здесь.
    const schema = await buildSchema({
        resolvers: [TaskResolver, UserResolver],
        authChecker: customAuthChecker,
    });

    const server = new ApolloServer({
        schema,
        context: ({ req }): MyContext => {
            const authHeader = req.headers.authorization || "";
            if (authHeader) {
                const token = authHeader.replace("Bearer ", "");
                try {
                    const payload: any = verify(token, process.env.JWT_SECRET!);
                    return { userId: payload.userId }; // Кладем ID в контекст
                } catch (err) {
                    // Если токен невалиден, контекст будет пустым
                }
            }
            return {};
        },
    });

    const {url} = await server.listen(4000);
    console.log(`🚀 Server ready at ${url}`);
}

main();