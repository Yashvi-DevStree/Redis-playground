/* eslint-disable prettier/prettier */
/* eslint-disable prettier/prettier */
import { Controller, Post, Body, BadRequestException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from 'src/user/user.service';
import { RolesService } from 'src/roles/roles.service';
import { CreateUserDto } from 'src/user/dto/create-user.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService, private userService: UsersService, private roleService: RolesService) { }


  @Post('register')
  async register(@Body() body: CreateUserDto) {
    // Fetch customer role (assumes it exists)
    const customerRole = await this.roleService.findByName('customer');

    // Pass Role object to AuthService
    const user = await this.authService.register(body, customerRole);
    return { success: true, message: 'User registered', data: user };
  }

  @Post('login')
  async login(@Body() body: { email: string; password: string }) {
    const user = await this.authService.validateUser(body.email, body.password);
    if (!user) throw new BadRequestException('Invalid credentials');
    return this.authService.login(user.email, body.password);
  }
}
