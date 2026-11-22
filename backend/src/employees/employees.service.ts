import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type { EmployeeRecord } from '@demo/shared';
import { Repository } from 'typeorm';
import { Employee } from './employees.entity.js';

@Injectable()
export class EmployeesService {
  constructor(@InjectRepository(Employee) private readonly employees: Repository<Employee>) { }

  findByEmail(email: string): Promise<Employee | null> {
    return this.employees
      .createQueryBuilder('employee')
      .where('LOWER(employee.Email) = LOWER(:email)', { email })
      .getOne();
  }

  async findAllWithEmail(): Promise<EmployeeRecord[]> {
    const employees = await this.employees
      .createQueryBuilder('employee')
      .where('employee.Email IS NOT NULL')
      .andWhere("TRIM(employee.Email) <> ''")
      .orderBy('employee.LastName', 'ASC')
      .addOrderBy('employee.FirstName', 'ASC')
      .getMany();

    return employees
      .filter((employee): employee is Employee & { Email: string } => employee.Email !== null)
      .map((employee) => ({
      employeeId: employee.EmployeeId,
      firstName: employee.FirstName,
      lastName: employee.LastName,
      email: employee.Email,
      }));
  }
}
