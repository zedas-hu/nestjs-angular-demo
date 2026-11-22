import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('employees')
export class Employee {
  @PrimaryGeneratedColumn()
  EmployeeId: number;

  @Column({ type: 'nvarchar', length: 20 })
  LastName: string;

  @Column({ type: 'nvarchar', length: 20 })
  FirstName: string;

  @Column({ type: 'nvarchar', length: 30, nullable: true })
  Title: string;

  @Column({ nullable: true })
  ReportsTo: number;

  @Column({ type: 'datetime', nullable: true })
  BirthDate: Date;

  @Column({ type: 'datetime', nullable: true })
  HireDate: Date;

  @Column({ type: 'nvarchar', length: 70, nullable: true })
  Address: string;

  @Column({ type: 'nvarchar', length: 40, nullable: true })
  City: string;

  @Column({ type: 'nvarchar', length: 40, nullable: true })
  State: string;

  @Column({ type: 'nvarchar', length: 40, nullable: true })
  Country: string;

  @Column({ type: 'nvarchar', length: 10, nullable: true })
  PostalCode: string;

  @Column({ type: 'nvarchar', length: 24, nullable: true })
  Phone: string;

  @Column({ type: 'nvarchar', length: 24, nullable: true })
  Fax: string;

  @Column({ type: 'nvarchar', length: 60, nullable: true })
  Email: string;
}
