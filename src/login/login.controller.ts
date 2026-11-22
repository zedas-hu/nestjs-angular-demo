import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Post, Req } from '@nestjs/common';
import type { CurrentUser, LoginSessionResponse } from '@demo/shared';
import type { FastifyRequest } from 'fastify';
import { createValidationPipe, problem } from '../common/problem.js';
import { EmployeesService } from '../employees/employees.service.js';
import { LoginRequestDto } from './dto/login-request.dto.js';
import { Public } from './public.decorator.js';

const loginBodyPipe = createValidationPipe('INVALID_LOGIN_DATA');
const anonymousUser: CurrentUser = { employeeId: null, firstName: null, lastName: null, email: null };

@Controller('login')
export class LoginController {
  constructor(private readonly employeesService: EmployeesService) { }

  @Get('session')
  getSession(@Req() request: FastifyRequest): CurrentUser {
    return request.session.currentUser ?? anonymousUser;
  }

  @Delete('session')
  @Public()
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(@Req() request: FastifyRequest): Promise<void> {
    await request.session.destroy();
  }

  @Post()
  @Public()
  @HttpCode(HttpStatus.OK)
  async login(
    @Body(loginBodyPipe) body: LoginRequestDto,
    @Req() request: FastifyRequest,
  ): Promise<LoginSessionResponse> {
    const employee = await this.employeesService.findByEmail(body.email);
    if (!employee) {
      throw problem(HttpStatus.BAD_REQUEST, 'EMPLOYEE_NOT_FOUND');
    }

    // A new session id after login prevents session fixation.
    await request.session.regenerate();
    request.session.currentUser = {
      employeeId: employee.EmployeeId,
      firstName: employee.FirstName,
      lastName: employee.LastName,
      email: employee.Email,
    };
    return { email: employee.Email };
  }
}
