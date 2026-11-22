import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Post, Req } from '@nestjs/common';
import type { Request } from 'express';

@Controller('login')
export class LoginController {
  @Get('session')
  getSession(@Req() request: Request) {
    // TODO: implement
  }

  @Delete('session')
  @HttpCode(HttpStatus.NO_CONTENT)
  logout(@Req() request: Request) {
    // TODO: implement
  }

  @Post()
  @HttpCode(HttpStatus.OK)
  login(@Body() loginRequest: unknown, @Req() request: Request) {
    // TODO: implement
  }
}
