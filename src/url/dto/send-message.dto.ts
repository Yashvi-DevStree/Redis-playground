/* eslint-disable prettier/prettier */
import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class SendMessageDto {
    @IsNotEmpty()
    @IsString()
    @MaxLength(50)
    shortCode: string;           // Short URL code

    @IsOptional()
    @IsString()
    @MaxLength(50)
    ip?: string;                 // Optional: override client IP

    @IsOptional()
    @IsString()
    @MaxLength(50)
    type?: string;               // Optional: event type

    @IsOptional()
    @IsString()
    @MaxLength(200)
    message?: string;            // Optional: custom message
}
