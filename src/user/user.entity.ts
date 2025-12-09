/* eslint-disable prettier/prettier */
import { Books } from 'src/books/books.entity';
import { Roles } from 'src/roles/roles.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    user_id: number;

    @Column()
    username: string;

    @Column({ unique: true })
    email: string;

    @Column()
    password: string;   

    @ManyToOne(() => Roles, role => role.users, { eager: true, nullable: true })
    @JoinColumn({ name: 'role_id' })
    role?: Roles;

    @OneToMany(() => Books, book => book.user)
    books: Books[];
}
