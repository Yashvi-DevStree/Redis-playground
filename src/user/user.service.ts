/* eslint-disable prettier/prettier */
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { Roles } from 'src/roles/roles.entity';

@Injectable()
export class UsersService {
    constructor(@InjectRepository(User) private userRepo: Repository<User>) { }


    async findByEmail(email: string) {
        return this.userRepo.findOne({ where: { email } });
    }

    async findById(id: number) {
        return this.userRepo.findOne({ where: { user_id: id } });
    }

    async createUser(data: Partial<User>) {
        const user = this.userRepo.create(data);
        return this.userRepo.save(user);
    }

    async updateRole(userId: number, role: Roles) {
        const user = await this.findById(userId);
        if (!user) throw new NotFoundException('User not found');
        user.role = role;
        return this.userRepo.save(user);
    }
}
//               