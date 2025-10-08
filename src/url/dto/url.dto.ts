/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-call */

import { IsUrl } from 'class-validator';

export class ShortenDto {
    @IsUrl()
    originalUrl: string;
}
