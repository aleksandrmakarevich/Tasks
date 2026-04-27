import {Entity, PrimaryGeneratedColumn, Column, BaseEntity, ManyToOne} from "typeorm";
import { ObjectType, Field, ID } from "type-graphql";
import {User} from "./User";

@ObjectType() // Помечаем как тип GraphQL
@Entity()     // Помечаем как таблицу базы данных
export class Task extends BaseEntity {
    @Field(() => ID)
    @PrimaryGeneratedColumn()
    id: number;

    @Field()
    @Column()
    title: string;

    @Field()
    @Column({ default: false })
    isCompleted: boolean;

    @Field({ nullable: true })
    @Column({ nullable: true })
    description?: string;

    @Field({ nullable: true })
    @Column({ nullable: true })
    comment?: string;

    @Field(() => User)
    @ManyToOne(() => User, (user) => user.tasks, { onDelete: "CASCADE" })
    author: User
}