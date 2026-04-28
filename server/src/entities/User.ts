import {Field, ID, ObjectType} from "type-graphql";
import {BaseEntity, BeforeInsert, Column, Entity, OneToMany, PrimaryGeneratedColumn} from "typeorm";
import {Task} from "./Task";
import {hash} from "bcryptjs";


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

    @Column()
    password: string;

    @BeforeInsert()
    async hashPassword() {
        if (this.password) {
            this.password = await hash(this.password, 12);
        }
    }

    @Field(() => [Task])
    @OneToMany(() => Task, (task) => task.author)
    tasks: Task[]
}