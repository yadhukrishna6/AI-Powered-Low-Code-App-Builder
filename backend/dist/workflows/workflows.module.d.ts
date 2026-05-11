import { OnModuleInit } from '@nestjs/common';
import { WorkflowRuntimeService } from './runtime/workflow-runtime.service';
import { StartNodeHandler } from './runtime/handlers/start.handler';
import { ConditionHandler } from './runtime/handlers/condition.handler';
import { ApiRequestHandler } from './runtime/handlers/api-request.handler';
import { NotificationHandler } from './runtime/handlers/notification.handler';
import { SaveDataHandler } from './runtime/handlers/save-data.handler';
import { TransformHandler } from './runtime/handlers/transform.handler';
import { ApprovalHandler } from './runtime/handlers/approval.handler';
export declare class WorkflowsModule implements OnModuleInit {
    private runtime;
    private startHandler;
    private conditionHandler;
    private apiHandler;
    private notificationHandler;
    private saveDataHandler;
    private transformHandler;
    private approvalHandler;
    constructor(runtime: WorkflowRuntimeService, startHandler: StartNodeHandler, conditionHandler: ConditionHandler, apiHandler: ApiRequestHandler, notificationHandler: NotificationHandler, saveDataHandler: SaveDataHandler, transformHandler: TransformHandler, approvalHandler: ApprovalHandler);
    onModuleInit(): void;
}
