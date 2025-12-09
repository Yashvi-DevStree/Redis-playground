/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable prettier/prettier */
import { Body, Controller, Delete, Get, Param, Post, Request, UseGuards } from '@nestjs/common';
import { BookService } from './books.service';
import { Roles } from 'src/common/decorators/roles.decorator';
import { CreateBookDto } from './dto/create-book.dto';
import { JwtAuthGuard } from 'src/common/guards/auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';


@Controller('books')
@UseGuards(JwtAuthGuard, RolesGuard)
export class BooksController {
  constructor(private readonly booksService: BookService) {}
  
  @Get()
  getAll(@Request() req) {
    return this.booksService.findAll(req.user); // TTL handled internally in service
  }

  @Post()
  @Roles('admin', 'author')
  create(@Request() req, @Body() dto: CreateBookDto) {
    return this.booksService.create(dto, req.user);
  }

  @Delete(':id')
  @Roles('admin', 'author')
  delete(@Param('id') id: string, @Request() req) {
    return this.booksService.delete(+id, req.user);
  }
}
