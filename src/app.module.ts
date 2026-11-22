import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { registerUnicodeLower } from './common/sqlite.js';
import { AlbumsModule } from './albums/albums.module.js';
import { ArtistsModule } from './artists/artists.module.js';
import { EmployeesModule } from './employees/employees.module.js';
import { GenresModule } from './genres/genres.module.js';
import { LoginModule } from './login/login.module.js';
import { MediaTypesModule } from './media-types/media-types.module.js';
import { TracksModule } from './tracks/tracks.module.js';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: () => ({
        type: 'better-sqlite3',
        database: process.env.DB_URL,
        entities: [],
        autoLoadEntities: true,
        synchronize: false,
        fileMustExist: true,
        prepareDatabase: registerUnicodeLower,
      }),
    }),
    TracksModule,
    AlbumsModule,
    ArtistsModule,
    GenresModule,
    MediaTypesModule,
    EmployeesModule,
    LoginModule,
  ],
})
export class AppModule {}

