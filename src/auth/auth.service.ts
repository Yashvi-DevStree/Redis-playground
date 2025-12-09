/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable prettier/prettier */

import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/user/user.service';
import { Roles } from 'src/roles/roles.entity';
import { CreateUserDto } from 'src/user/dto/create-user.dto';

@Injectable()
export class AuthService {
    constructor(private usersService: UsersService, private jwtService: JwtService) { }

    async validateUser(email: string, pass: string) {
        const user = await this.usersService.findByEmail(email);
        if (!user) return null;

        const match = await bcrypt.compare(pass, user.password);
        if (!match) return null;
        
        const {password: _, ...result} = user;
        return result;
    }

    async login(username: string, password: string) {
        const user = await this.validateUser(username, password);
        if (!user) throw new UnauthorizedException('Invalid credentials');
        
        const payload = { sub: user.user_id, username: user.username, role: user.role?.name }
        return { access_token: this.jwtService.sign(payload) }
        
    }

    async register(userDto: CreateUserDto, role: Roles) {
        // Hash password
        const hashedPassword = await bcrypt.hash(userDto.password, 10);
    
        // Create user with role                    
        
        const user = await this.usersService.createUser({
            ...userDto,
            password: hashedPassword,
            role,
        });
    
        return user;
    }
    
    // async validateUser(email: string, pass: string) {
    //     const user = await this.usersService.findByEmail(email);
    //     if (!user) return null;
    //     const ok = await bcrypt.compare(pass, user.password);
    //     if (ok) return user;
    //     return null;
    // }

    // login(user: any) {
    //     const payload = { sub: user.user_id, email: user.email, role: user.role?.name || user.role };
    //     return {
    //         message: 'Login successful',
    //         data: {
    //             token: this.jwtService.sign(payload),
    //             user: { user_id: user.user_id, email: user.email, role: payload.role },
    //         },
    //     };
    // }

    // async register(data: { name: string; email: string; password: string }, Roles?: any) {
    //     const hashed = await bcrypt.hash(data.password, 10);
    //     return this.usersService.createUser({
    //         username: data.name,
    //         email: data.email,
    //         password: hashed,
    //         role: Roles, // RoleEntity or null; default handled in controller/service
    //     });
    // }
    
}                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      