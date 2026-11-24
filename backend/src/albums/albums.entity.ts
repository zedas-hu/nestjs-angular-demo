import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

// CREATE TABLE "albums" (
//   "AlbumId" integer PRIMARY KEY AUTOINCREMENT NOT NULL, 
//   "Title" nvarchar(160) NOT NULL, 
//   "ArtistId" integer NOT NULL
// )

@Entity('albums')
export class Album {
  @PrimaryGeneratedColumn()
  AlbumId: number;

  @Column({ type: 'nvarchar', length: 160 })
  Title: string;

  @Column()
  ArtistId: number;
}
