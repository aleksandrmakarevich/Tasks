import {Arg, Args, Mutation, Query, Resolver} from "type-graphql";
import {User} from "../entities/User";
import {CreateTaskInput} from "../inputs/CreateTaskInput";
import {Task} from "../entities/Task";

@Resolver()
export class UserResolver {
    @Query(() => [User])
    async getUsers() {
        return await User.find({ relations: { tasks: true } }); // LEFT JOIN
    }

    @Mutation(() => User)
    async registerUserWithTasks(
        @Arg("login") login: string,
        @Arg("email") email: string,
        @Arg("initTasks", () => [CreateTaskInput]) tasksData: CreateTaskInput[]
    ) {
        return await User.getRepository().manager.transaction(async (manager) => {

            const user = manager.create(User, {login, email})
            await manager.save(user)

            const tasks = tasksData.map(data => manager.create(Task, {...data, author: user}))

            await manager.save(tasks)

            return user
        })
    }
}