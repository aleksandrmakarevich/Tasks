import {Arg, Args, Mutation, Query, Resolver} from "type-graphql";
import {Task} from "../entities/Task";
import {CreateTaskInput} from "../inputs/CreateTaskInput";
import {UpdateTaskInput} from "../inputs/UpdateTaskInput";
import {FilterTaskArgs} from "../inputs/FilterTaskArgs";

@Resolver()
export class TaskResolver {
    @Query(() => [Task])
    async getTasks() {
        return await Task.find(); // Просто вернет все задачи из базы
    }

    @Query(() => [Task])
    async getTasksFiltered(
        @Args() {search, isCompleted, sortBy}: FilterTaskArgs
    ) {
        const query = Task.createQueryBuilder("task")
        if (search) {
            query.where("task.title LIKE :search", {search: `%${search}%`})
        }
        if (isCompleted !== undefined) {
            query.andWhere("task.isCompleted = :isCompleted", {isCompleted})
        }
        query.orderBy("task.id", sortBy)
        return await query.getMany()
    }

    @Mutation(() => Task)
    async createTask(
        @Arg("data") data: CreateTaskInput
    ) {
        const task = Task.create({
            ...data,
            isCompleted: false
        })

        await task.save()
        return task
    }

    @Mutation(() => Task, {nullable: true})
    async updateTask(
        @Arg("id") id: number,
        @Arg("data") data: UpdateTaskInput
    ) {
        const task = await Task.findOneBy({id})
        if (!task) return null
        Object.assign(task, data)
        return await task.save()
    }

    @Mutation(() => [Task])
    async deleteCompletedTasks() {
        try {
            const task = await Task.getRepository().query("SELECT * FROM task WHERE isCompleted = 1")
            await Task.getRepository().query("DELETE FROM task WHERE isCompleted = 1")
            return task
        } catch (err: any) {
            throw new Error("Error deleting completed tasks: " + err.message)
        }
    }

    @Mutation(() => [Task])
    async insertManyTasks(
        @Arg("tasks", () => [CreateTaskInput]) tasksData: CreateTaskInput[]
    ) {
        const tasks = tasksData.map(data => Task.create({...data}))
        return await Task.save(tasks)
    }
}