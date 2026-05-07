import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { FormsModule } from './forms/forms.module';
import { SubmissionsModule } from './submissions/submissions.module';
import { ProjectsController } from './projects/projects.controller';
import { WorkflowsModule } from './workflows/workflows.module';
import { RulesController } from './rules/rules.controller';

@Module({
  imports: [PrismaModule, FormsModule, SubmissionsModule, WorkflowsModule],
  controllers: [ProjectsController, RulesController],
  providers: [],
})
export class AppModule {}
