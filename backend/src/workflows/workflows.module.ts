import { Module, OnModuleInit } from '@nestjs/common';
import { WorkflowsController } from './workflows.controller';
import { WorkflowsService } from './workflows.service';
import { AIWorkflowService } from './ai-workflow.service';
import { PrismaModule } from '../prisma/prisma.module';
import { BullModule } from '@nestjs/bullmq';
import { WorkflowRuntimeService } from './runtime/workflow-runtime.service';
import { WorkflowOrchestrator } from './runtime/workflow-orchestrator.service';
import { WorkflowWorker } from './runtime/workflow-worker.service';
import { WorkflowGateway } from './runtime/workflow.gateway';
import { StartNodeHandler } from './runtime/handlers/start.handler';
import { ConditionHandler } from './runtime/handlers/condition.handler';
import { ApiRequestHandler } from './runtime/handlers/api-request.handler';
import { NotificationHandler } from './runtime/handlers/notification.handler';
import { SaveDataHandler } from './runtime/handlers/save-data.handler';
import { TransformHandler } from './runtime/handlers/transform.handler';
import { ApprovalHandler } from './runtime/handlers/approval.handler';
import { SwitchHandler } from './runtime/handlers/switch.handler';
import { LoopHandler } from './runtime/handlers/loop.handler';
import { ScheduleHandler } from './runtime/handlers/schedule.handler';
import { ExpressionResolverService } from './runtime/expression-resolver.service';

@Module({
  imports: [
    PrismaModule,
    BullModule.registerQueue({
      name: 'workflow-queue',
    }),
  ],
  controllers: [WorkflowsController],
  providers: [
    WorkflowsService, 
    AIWorkflowService,
    WorkflowRuntimeService,
    WorkflowOrchestrator,
    WorkflowWorker,
    WorkflowGateway,
    ExpressionResolverService,
    StartNodeHandler,
    ConditionHandler,
    ApiRequestHandler,
    NotificationHandler,
    SaveDataHandler,
    TransformHandler,
    ApprovalHandler,
    SwitchHandler,
    LoopHandler,
    ScheduleHandler
  ],
  exports: [WorkflowsService, WorkflowRuntimeService, WorkflowOrchestrator],
})
export class WorkflowsModule implements OnModuleInit {
  constructor(
    private runtime: WorkflowRuntimeService,
    private startHandler: StartNodeHandler,
    private conditionHandler: ConditionHandler,
    private apiHandler: ApiRequestHandler,
    private notificationHandler: NotificationHandler,
    private saveDataHandler: SaveDataHandler,
    private transformHandler: TransformHandler,
    private approvalHandler: ApprovalHandler,
    private switchHandler: SwitchHandler,
    private loopHandler: LoopHandler,
    private scheduleHandler: ScheduleHandler
  ) {}

  onModuleInit() {
    this.runtime.registerHandler('start', this.startHandler);
    this.runtime.registerHandler('condition', this.conditionHandler);
    this.runtime.registerHandler('form-submitted', this.startHandler);
    this.runtime.registerHandler('api-request', this.apiHandler);
    this.runtime.registerHandler('send-notification', this.notificationHandler);
    this.runtime.registerHandler('save-data', this.saveDataHandler);
    this.runtime.registerHandler('transform', this.transformHandler);
    this.runtime.registerHandler('approval', this.approvalHandler);
    this.runtime.registerHandler('switch', this.switchHandler);
    this.runtime.registerHandler('loop', this.loopHandler);
    this.runtime.registerHandler('schedule', this.scheduleHandler);
    this.runtime.registerHandler('end', this.startHandler); 
  }
}
