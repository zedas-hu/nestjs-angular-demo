import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { EmployeesModule } from '../employees/employees.module.js';
import { LoginController } from './login.controller.js';
import { SessionAuthGuard } from './session-auth.guard.js';

@Module({
  imports: [EmployeesModule],
  controllers: [LoginController],
  providers: [{ provide: APP_GUARD, useClass: SessionAuthGuard }],
})
export class LoginModule {}
