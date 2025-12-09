/* eslint-disable prettier/prettier */
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Roles } from './roles.entity';
import { Repository } from 'typeorm';
import { CreateRoleDto } from './dto/create-role.dto';

@Injectable()
export class RolesService {
    constructor(@InjectRepository(Roles) private roleRepository: Repository<Roles>) { }

    create(dto: CreateRoleDto) {
        const role = this.roleRepository.create(dto);
        return this.roleRepository.save(role);
    }

    findAll() {
        return this.roleRepository.find();
    }

    async findByName(name: string): Promise<Roles> {
        const role = await this.roleRepository.findOne({ where: { name } });
        if (!role) throw new NotFoundException(`Role ${name} not found`);
        return role;
    }
}
