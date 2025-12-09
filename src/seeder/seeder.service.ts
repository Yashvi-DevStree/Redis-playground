/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RolesService } from 'src/roles/roles.service';
import { UsersService } from 'src/user/user.service';

@Injectable()
export class SeederService {
    constructor(
        private roleService: RolesService,
        private userService: UsersService,
        private configService: ConfigService,
    ) { }

    async seed() {
        const adminEmail = this.configService.get<string>('SEED_ADMIN_EMAIL');
        const adminPass = this.configService.get<string>('SEED_ADMIN_PASS');

        if (!adminEmail || !adminPass) {
            throw new Error('SEED_ADMIN_EMAIL or SEED_ADMIN_PASS not defined in .env');
        }

        // 1️⃣ Ensure admin role exists
        let adminRole;
        try {
            adminRole = await this.roleService.findByName('admin');
        } catch (err) {
            // Role not found, create it
            adminRole = await this.roleService.create({ name: 'admin' });
            console.log('Admin role created.');
        }

        // 2️⃣ Check if admin user exists
        const existingAdmin = await this.userService.findByEmail(adminEmail);
        if (existingAdmin) {
            console.log('Admin already exists.');
            return;
        }

        // 3️⃣ Create admin user
        await this.userService.createUser({
            username: 'Admin',
            email: adminEmail,
            password: adminPass, // plain password; hashing handled in UserService/AuthService
            role: adminRole,
        });

        console.log(`Admin user created: ${adminEmail}`);
    }
}
