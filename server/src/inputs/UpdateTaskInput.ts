import {Field, InputType} from "type-graphql";


@InputType()
export class UpdateTaskInput {
    @Field({ nullable: true })
    title?: string;

    @Field({ nullable: true })
    description?: string;

    @Field({ nullable: true })
    comment?: string;

    @Field({ nullable: true })
    isCompleted?: boolean;
}