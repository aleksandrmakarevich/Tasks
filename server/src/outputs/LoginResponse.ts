import {Field, ObjectType} from "type-graphql";
import {User} from "../entities/User";

@ObjectType()
export class LoginResponse {
    @Field()
    token: string;

    @Field(() => User)
    user: User;
}