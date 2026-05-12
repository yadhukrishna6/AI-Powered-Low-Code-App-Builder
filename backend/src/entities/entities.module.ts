import { Module } from '@nestjs/common';
import { EntitiesController } from './entities.controller';
import { EntitiesService } from './entities.service';
import { SchemaEngineService } from './schema-engine.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [EntitiesController],
  providers: [EntitiesService, SchemaEngineService],
  exports: [EntitiesService, SchemaEngineService],
})
export class EntitiesModule {}
