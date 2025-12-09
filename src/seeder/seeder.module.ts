/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { SeederService } from './seeder.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/user/user.entity';
import { ConfigModule } from '@nestjs/config';
import { RolesService } from 'src/roles/roles.service';
import { UsersService } from 'src/user/user.service';
import { Roles } from 'src/roles/roles.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Roles]),
    ConfigModule,
  ],
  providers: [SeederService, RolesService, UsersService],
  exports: [SeederService],
})
export class SeederModule { }
