import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { PrismaModule } from './prisma/prisma.module';
import { FormsModule } from './forms/forms.module';
import { SubmissionsModule } from './submissions/submissions.module';
import { ProjectsController } from './projects/projects.controller';
import { WorkflowsModule } from './workflows/workflows.module';
import { CredentialsModule } from './credentials/credentials.module';
import { RulesController } from './rules/rules.controller';
import { EntitiesModule } from './entities/entities.module';
import { ApplicationsModule } from './applications/applications.module';

@Module({
  imports: [
    PrismaModule, 
    FormsModule, 
    SubmissionsModule, 
    WorkflowsModule,
    CredentialsModule,
    EntitiesModule,
    ApplicationsModule,
    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
      },
    }),
  ],
  controllers: [ProjectsController, RulesController],
  providers: [],
})
export class AppModule {}
