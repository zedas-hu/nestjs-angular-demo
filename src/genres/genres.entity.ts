import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('genres')
export class Genre {
  @PrimaryGeneratedColumn()
  GenreId: number;

  @Column({ type: 'nvarchar', length: 120, nullable: true })
  Name: string;
}
