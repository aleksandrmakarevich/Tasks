import {Arg, Args, Authorized, Ctx, Mutation, Query, Resolver} from "type-graphql";
import {Task} from "../entities/Task";
import {CreateTaskInput} from "../inputs/CreateTaskInput";
import {UpdateTaskInput} from "../inputs/UpdateTaskInput";
import {FilterTaskArgs} from "../inputs/FilterTaskArgs";
import {MyContext} from "../index";
import {getIO} from "../socket";

@Resolver()
export class TaskResolver {
    @Query(() => [Task])
    @Authorized()
    async getTasks(
        @Ctx() {userId}: MyContext
    ) {
        return await Task.find({ where: { authorId: userId }, relations: { author: true } });
    }

    @Query(() => [Task])
    @Authorized()
    async getTasksFiltered(
        @Args() {search, isCompleted, sortBy}: FilterTaskArgs,
        @Ctx() {userId}: MyContext
    ) {
        const query = Task.createQueryBuilder("task")
            .leftJoinAndSelect("task.author", "author")
            .where("task.authorId = :userId", {userId})
        if (search) {
            query.andWhere("task.title LIKE :search", {search: `%${search}%`})
        }
        if (isCompleted !== undefined) {
            query.andWhere("task.isCompleted = :isCompleted", {isCompleted})
        }
        query.orderBy("task.id", sortBy)
        return await query.getMany()
    }

    @Mutation(() => Task)
    @Authorized() // Теперь сюда пустят только с токеном
    async createTask(
        @Arg("data") data: CreateTaskInput,
        @Ctx() {userId}: MyContext // Извлекаем ID того, кто делает запрос
    ) {
        const task = Task.create({
            ...data,
            isCompleted: false,
            authorId: userId
        });

        await task.save();
        const result = await Task.findOne({where: {id: task.id}, relations: {author: true}});
        getIO().emit("task:created", result);
        return result;
    }

    @Mutation(() => Task, {nullable: true})
    @Authorized()
    async updateTask(
        @Arg("id") id: number,
        @Arg("data") data: UpdateTaskInput,
        @Ctx() { userId }: MyContext
    ) {
        const task = await Task.findOneBy({id, authorId: userId})
        if (!task) throw new Error("Task not found")
        Object.assign(task, data)
        await task.save()
        const result = await Task.findOne({ where: { id: task.id }, relations: { author: true } });
        getIO().emit("task:updated", result);
        return result;
    }

    @Mutation(() => [Task])
    @Authorized()
    async deleteCompletedTasks(@Ctx() { userId }: MyContext) {
        const tasks = await Task.find({
            where: { authorId: userId, isCompleted: true },
            relations: { author: true }
        })
        const snapshot = tasks.map(t => ({ ...t })) as Task[]
        await Task.remove(tasks)
        getIO().emit("task:deleted", { ids: snapshot.map(t => t.id) });
        return snapshot
    }

    @Mutation(() => Boolean)
    @Authorized()
    async deleteAllTasks(@Ctx() { userId }: MyContext) {
        await Task.delete({ authorId: userId });
        getIO().emit("task:deleted", { all: true, userId });
        return true;
    }

    @Mutation(() => [Task])
    @Authorized()
    async insertManyTasks(
        @Arg("tasks", () => [CreateTaskInput]) tasksData: CreateTaskInput[],
        @Ctx() { userId }: MyContext
    ) {
        const tasks = tasksData.map(data => Task.create({...data, authorId: userId}))
        const saved = await Task.save(tasks)
        const result = await Task.find({ where: saved.map(t => ({ id: t.id })), relations: { author: true } });
        getIO().emit("task:created", result);
        return result;
    }
}