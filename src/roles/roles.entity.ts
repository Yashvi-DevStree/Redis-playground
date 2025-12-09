/* eslint-disable prettier/prettier */
import { User } from "src/user/user.entity";
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Roles {
    @PrimaryGeneratedColumn()
    role_id: number;

    @Column()
    name: string;

    @OneToMany(() => User, user => user.role)
    users: User[];
}