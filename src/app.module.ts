import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TracksModule } from './tracks/tracks.module.js';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: () => ({
        type: 'better-sqlite3',
        database: process.env.DB_URL,
        entities: [],
        autoLoadEntities: true,
        synchronize: true,
      }),
    }),
    TracksModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

