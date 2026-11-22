import { Controller, Get } from '@nestjs/common';
import type { EmployeeRecord } from '@demo/shared';
import { EmployeesService } from './employees.service.js';

@Controller('employees')
export class EmployeesController {
  constructor(private readonly employeesService: EmployeesService) { }

  @Get()
  getEmployees(): Promise<EmployeeRecord[]> {
    return this.employeesService.findAllWithEmail();
  }
}
