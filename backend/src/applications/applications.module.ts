import { Module } from '@nestjs/common';
import { ApplicationsController } from './applications.controller';
import { ApplicationsService } from './applications.service';
import { CrudGeneratorService } from './crud-generator.service';
import { AIArchitectService } from './ai-architect.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ApplicationsController],
  providers: [ApplicationsService, CrudGeneratorService, AIArchitectService],
  exports: [ApplicationsService, CrudGeneratorService, AIArchitectService],
})
export class ApplicationsModule {}
