import {Field, ID, ObjectType} from "type-graphql";
import {BaseEntity, Column, Entity, OneToMany, PrimaryGeneratedColumn} from "typeorm";
import {Task} from "./Task";


@ObjectType()
@Entity()
export class User extends BaseEntity {
    @Field(() => ID)
    @PrimaryGeneratedColumn()
    id: number

    @Field()
    @Column({ unique: true })
    login: string

    @Field()
    @Column({ unique: true })
    email: string

    @Field(() => Task)
    @OneToMany(() => Task, (task) => task.author)
    tasks: Task[]
}