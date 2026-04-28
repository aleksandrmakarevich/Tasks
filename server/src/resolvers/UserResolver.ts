import {Arg, Mutation, Query, Resolver} from "type-graphql";
import {User} from "../entities/User";
import {CreateTaskInput} from "../inputs/CreateTaskInput";
import {Task} from "../entities/Task";
import {redis} from "../redis";
import {compare} from "bcryptjs";
import {sign} from "jsonwebtoken";
import {LoginResponse} from "../outputs/LoginResponse";
import {AppDataSource} from "../data-source";

@Resolver()
export class UserResolver {
    @Query(() => [User])
    async getUsers() {
        const cacheKey = "users:all";
        // 1. Пытаемся взять из Redis
        const cachedUsers = await redis.get(cacheKey);
        if (cachedUsers) {
            console.log("--- Данные взяты из REDIS ---");
            return JSON.parse(cachedUsers);
        }
        console.log("--- Данные взяты из DATABASE (TypeORM) ---");
        const users = await User.find({ relations: { tasks: true } }) // LEFT JOIN
        await redis.set(cacheKey, JSON.stringify(users), "EX", 60)
        return users;
    }

    @Mutation(() => User)
    async registerUserWithTasks(
        @Arg("login") login: string,
        @Arg("email") email: string,
        @Arg("password") password: string,
        @Arg("tasks", () => [CreateTaskInput]) tasksData: CreateTaskInput[]
    ) {
        return await AppDataSource.manager.transaction(async (manager) => {

            const user = manager.create(User, {login, email, password})
            await manager.save(user)

            const tasks = tasksData.map(data => manager.create(Task, {...data, author: user}))

            const finalUser = await manager.findOne(User, {
                where: { id: user.id },
                relations: { tasks: true }
            });

            if (finalUser && finalUser.tasks) {
                // Принудительно превращаем каждый объект в экземпляр класса Task
                finalUser.tasks = finalUser.tasks.map(t => {
                    const taskInstance = new Task();
                    Object.assign(taskInstance, t);
                    return taskInstance;
                });
            }

            // console.log("DEBUG - User Tasks:", JSON.stringify(finalUser, null, 2));
            return finalUser;
        })
    }

    @Mutation(() => LoginResponse)
    async login(
        @Arg("login") login: string,
        @Arg("password") password: string
    ) {
        const user = await User.findOne({
            where: {login: login},
            relations: { tasks: true }
        })
        if (!user || !(await compare(password, user.password))) {
            throw new Error("Incorrect login or password")
        }
        //token
        const token = sign(
            { userId: user.id },
            process.env.JWT_SECRET || "default_secret", // Берем секрет из .env
            { expiresIn: "1d" } // Токен будет жить 1 день
        )
        return {
            token,
            user
        };
    }

    @Mutation(() => [User])
    async deleteAllUsers() {
        await User.getRepository().clear();
        console.log("🗑️ All Users deleted from database");
    }
}