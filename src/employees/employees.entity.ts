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
  Title: string | null;

  @Column({ type: 'integer', nullable: true })
  ReportsTo: number | null;

  @Column({ type: 'datetime', nullable: true })
  BirthDate: Date | null;

  @Column({ type: 'datetime', nullable: true })
  HireDate: Date | null;

  @Column({ type: 'nvarchar', length: 70, nullable: true })
  Address: string | null;

  @Column({ type: 'nvarchar', length: 40, nullable: true })
  City: string | null;

  @Column({ type: 'nvarchar', length: 40, nullable: true })
  State: string | null;

  @Column({ type: 'nvarchar', length: 40, nullable: true })
  Country: string | null;

  @Column({ type: 'nvarchar', length: 10, nullable: true })
  PostalCode: string | null;

  @Column({ type: 'nvarchar', length: 24, nullable: true })
  Phone: string | null;

  @Column({ type: 'nvarchar', length: 24, nullable: true })
  Fax: string | null;

  @Column({ type: 'nvarchar', length: 60, nullable: true })
  Email: string | null;
}
