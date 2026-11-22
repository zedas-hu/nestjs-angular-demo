import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

// CREATE TABLE "tracks"
// (
//     [TrackId] INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
//     [Name] NVARCHAR(200)  NOT NULL,
//     [AlbumId] INTEGER,
//     [MediaTypeId] INTEGER  NOT NULL,
//     [GenreId] INTEGER,
//     [Composer] NVARCHAR(220),
//     [Milliseconds] INTEGER  NOT NULL,
//     [Bytes] INTEGER,
//     [UnitPrice] NUMERIC(10,2)  NOT NULL,
//     FOREIGN KEY ([AlbumId]) REFERENCES "albums" ([AlbumId]) 
// 		ON DELETE NO ACTION ON UPDATE NO ACTION,
//     FOREIGN KEY ([GenreId]) REFERENCES "genres" ([GenreId]) 
// 		ON DELETE NO ACTION ON UPDATE NO ACTION,
//     FOREIGN KEY ([MediaTypeId]) REFERENCES "media_types" ([MediaTypeId]) 
// 		ON DELETE NO ACTION ON UPDATE NO ACTION
// )

@Entity('tracks')
export class Track {
    @PrimaryGeneratedColumn()
    TrackId: number;

    @Column({ type: 'nvarchar', length: 200 })
    Name: string;

    @Column({ type: 'integer', nullable: true })
    AlbumId: number | null;

    @Column()
    MediaTypeId: number;

    @Column({ type: 'integer', nullable: true })
    GenreId: number | null;

    @Column({ type: 'nvarchar', length: 220, nullable: true })
    Composer: string | null;

    @Column()
    Milliseconds: number;

    @Column({ type: 'integer', nullable: true })
    Bytes: number | null;

    @Column({ type: 'numeric', precision: 10, scale: 2 })
    UnitPrice: number;
}