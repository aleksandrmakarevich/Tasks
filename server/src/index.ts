import "reflect-metadata"; // ОБЯЗАТЕЛЬНО ПЕРВЫМ ИМПОРТОМ
import {ApolloServer} from "apollo-server";
import {buildSchema} from "type-graphql";
import {DataSource} from "typeorm";
import {Task} from "./entities/Task";
import {TaskResolver} from "./resolvers/TaskResolver"; // Файл, который мы создали шагом ранее

async function main() {
    // 1. Настройка базы данных (TypeORM)
    const AppDataSource = new DataSource({
        type: "sqlite",
        database: "database.sqlite",
        synchronize: true, // Автоматически создает таблицы (только для разработки!)
        logging: true,
        entities: [Task],
    });

    await AppDataSource.initialize()
        .then(() => console.log("Data Source has been initialized!"))
        .catch((err) => console.error("Error during Data Source initialization", err));

    // 2. Настройка GraphQL (Type-GraphQL + Apollo)
    // Нам нужен хотя бы один Resolver, чтобы сервер запустился.
    // Пока сделаем "заглушку" прямо здесь.
    const schema = await buildSchema({
        resolvers: [TaskResolver],
        validate: false,
    });

    const server = new ApolloServer({schema});

    const {url} = await server.listen(4000);
    console.log(`🚀 Server ready at ${url}`);
}

main();