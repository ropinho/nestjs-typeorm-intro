import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TasksModule } from './tasks/tasks.module';

@Module({
  imports: [
    TypeOrmModule.forRoot(),
    TypeOrmModule.forRoot({ name: 'albumsConnection' }),
    TasksModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
