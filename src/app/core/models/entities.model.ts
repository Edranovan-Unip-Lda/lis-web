import { Role } from "./data-master.model";

export interface User {
    id: number;
    firstName: string;
    lastName: string;
    username: string;
    email: string;
    password: string;
    role: Role;
    jwtSession: string;
    status: string;
    oneTimePassword: string;
    updatedAt: Date;
}