import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('artists')
export class Artist {
  @PrimaryGeneratedColumn()
  ArtistId: number;

  @Column({ type: 'nvarchar', length: 120, nullable: true })
  Name: string | null;
}
