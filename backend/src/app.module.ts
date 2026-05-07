import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { FormsModule } from './forms/forms.module';
import { SubmissionsModule } from './submissions/submissions.module';
import { ProjectsController } from './projects/projects.controller';
import { WorkflowsController } from './workflows/workflows.controller';
import { RulesController } from './rules/rules.controller';

@Module({
  imports: [PrismaModule, FormsModule, SubmissionsModule],
  controllers: [ProjectsController, WorkflowsController, RulesController],
  providers: [],
})
export class AppModule {}
