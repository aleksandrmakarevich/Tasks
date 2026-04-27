import {ArgsType, Field} from "type-graphql";

@ArgsType()
export class FilterTaskArgs {
    @Field({ nullable: true })
    search?: string;

    @Field({ nullable: true })
    isCompleted?: boolean;

    @Field({ defaultValue: "DESC" })
    sortBy?: "ASC" | "DESC";
}