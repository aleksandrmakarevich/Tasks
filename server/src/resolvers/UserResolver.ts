import {Arg, Mutation, Query, Resolver} from "type-graphql";
import {User} from "../entities/User";
import {CreateTaskInput} from "../inputs/CreateTaskInput";
import {Task} from "../entities/Task";
import {redis} from "../redis";

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
        @Arg("tasks", () => [CreateTaskInput]) tasksData: CreateTaskInput[]
    ) {
        return await User.getRepository().manager.transaction(async (manager) => {

            const user = manager.create(User, {login, email})
            await manager.save(user)

            const tasks = tasksData.map(data => manager.create(Task, {...data, author: user}))

            const savedTasks = await manager.save(tasks)

            // Собираем "идеальный" объект для GraphQL
            // user.tasks = savedTasks.map((savedTask, index) => {
            //     return {
            //         ...savedTask,          // тут есть ID
            //         ...tasksData[index]    // тут есть title, description, comment
            //     } as Task;
            // });

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

            console.log("DEBUG - User Tasks:", JSON.stringify(finalUser, null, 2));
            return finalUser;
        })
    }

    @Mutation(() => [User])
    async deleteAllUsers() {
        await User.getRepository().clear();
        console.log("🗑️ All Users deleted from database");
    }
}