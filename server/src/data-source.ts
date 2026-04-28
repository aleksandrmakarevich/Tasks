import "reflect-metadata";
import { DataSource } from "typeorm";
import { Task } from "./entities/Task";
import { User } from "./entities/User";

export const AppDataSource = new DataSource({
    type: "sqlite",
    database: "database.sqlite",
    synchronize: true,
    logging: true,
    entities: [Task, User],
});
