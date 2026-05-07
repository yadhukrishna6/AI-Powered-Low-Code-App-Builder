import { Module, OnModuleInit } from '@nestjs/common';
import { WorkflowsController } from './workflows.controller';
import { WorkflowsService } from './workflows.service';
import { PrismaModule } from '../prisma/prisma.module';
import { WorkflowRuntimeService } from './runtime/workflow-runtime.service';
import { StartNodeHandler } from './runtime/handlers/start.handler';
import { ConditionHandler } from './runtime/handlers/condition.handler';
import { ApiRequestHandler } from './runtime/handlers/api-request.handler';
import { NotificationHandler } from './runtime/handlers/notification.handler';
import { SaveDataHandler } from './runtime/handlers/save-data.handler';
import { TransformHandler } from './runtime/handlers/transform.handler';

@Module({
  imports: [PrismaModule],
  controllers: [WorkflowsController],
  providers: [
    WorkflowsService, 
    WorkflowRuntimeService,
    StartNodeHandler,
    ConditionHandler,
    ApiRequestHandler,
    NotificationHandler,
    SaveDataHandler,
    TransformHandler
  ],
  exports: [WorkflowsService, WorkflowRuntimeService],
})
export class WorkflowsModule implements OnModuleInit {
  constructor(
    private runtime: WorkflowRuntimeService,
    private startHandler: StartNodeHandler,
    private conditionHandler: ConditionHandler,
    private apiHandler: ApiRequestHandler,
    private notificationHandler: NotificationHandler,
    private saveDataHandler: SaveDataHandler,
    private transformHandler: TransformHandler
  ) {}

  onModuleInit() {
    this.runtime.registerHandler('start', this.startHandler);
    this.runtime.registerHandler('condition', this.conditionHandler);
    this.runtime.registerHandler('form-submitted', this.startHandler);
    this.runtime.registerHandler('api-request', this.apiHandler);
    this.runtime.registerHandler('send-notification', this.notificationHandler);
    this.runtime.registerHandler('save-data', this.saveDataHandler);
    this.runtime.registerHandler('transform', this.transformHandler);
    this.runtime.registerHandler('end', this.startHandler); // Reuse start for end as well for now
  }
}
