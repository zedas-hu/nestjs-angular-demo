import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('albums')
export class Album {
  @PrimaryGeneratedColumn()
  AlbumId: number;

  @Column({ type: 'nvarchar', length: 160 })
  Title: string;

  @Column()
  ArtistId: number;
}
