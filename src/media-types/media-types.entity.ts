import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('media_types')
export class MediaType {
  @PrimaryGeneratedColumn()
  MediaTypeId: number;

  @Column({ type: 'nvarchar', length: 120, nullable: true })
  Name: string | null;
}
