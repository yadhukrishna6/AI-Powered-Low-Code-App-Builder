"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkflowsModule = void 0;
const common_1 = require("@nestjs/common");
const workflows_controller_1 = require("./workflows.controller");
const workflows_service_1 = require("./workflows.service");
const ai_workflow_service_1 = require("./ai-workflow.service");
const prisma_module_1 = require("../prisma/prisma.module");
const bullmq_1 = require("@nestjs/bullmq");
const workflow_runtime_service_1 = require("./runtime/workflow-runtime.service");
const workflow_orchestrator_service_1 = require("./runtime/workflow-orchestrator.service");
const workflow_worker_service_1 = require("./runtime/workflow-worker.service");
const workflow_gateway_1 = require("./runtime/workflow.gateway");
const start_handler_1 = require("./runtime/handlers/start.handler");
const condition_handler_1 = require("./runtime/handlers/condition.handler");
const api_request_handler_1 = require("./runtime/handlers/api-request.handler");
const notification_handler_1 = require("./runtime/handlers/notification.handler");
const save_data_handler_1 = require("./runtime/handlers/save-data.handler");
const transform_handler_1 = require("./runtime/handlers/transform.handler");
const approval_handler_1 = require("./runtime/handlers/approval.handler");
const switch_handler_1 = require("./runtime/handlers/switch.handler");
const loop_handler_1 = require("./runtime/handlers/loop.handler");
const schedule_handler_1 = require("./runtime/handlers/schedule.handler");
const expression_resolver_service_1 = require("./runtime/expression-resolver.service");
let WorkflowsModule = class WorkflowsModule {
    runtime;
    startHandler;
    conditionHandler;
    apiHandler;
    notificationHandler;
    saveDataHandler;
    transformHandler;
    approvalHandler;
    switchHandler;
    loopHandler;
    scheduleHandler;
    constructor(runtime, startHandler, conditionHandler, apiHandler, notificationHandler, saveDataHandler, transformHandler, approvalHandler, switchHandler, loopHandler, scheduleHandler) {
        this.runtime = runtime;
        this.startHandler = startHandler;
        this.conditionHandler = conditionHandler;
        this.apiHandler = apiHandler;
        this.notificationHandler = notificationHandler;
        this.saveDataHandler = saveDataHandler;
        this.transformHandler = transformHandler;
        this.approvalHandler = approvalHandler;
        this.switchHandler = switchHandler;
        this.loopHandler = loopHandler;
        this.scheduleHandler = scheduleHandler;
    }
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
};
exports.WorkflowsModule = WorkflowsModule;
exports.WorkflowsModule = WorkflowsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            prisma_module_1.PrismaModule,
            bullmq_1.BullModule.registerQueue({
                name: 'workflow-queue',
            }),
        ],
        controllers: [workflows_controller_1.WorkflowsController],
        providers: [
            workflows_service_1.WorkflowsService,
            ai_workflow_service_1.AIWorkflowService,
            workflow_runtime_service_1.WorkflowRuntimeService,
            workflow_orchestrator_service_1.WorkflowOrchestrator,
            workflow_worker_service_1.WorkflowWorker,
            workflow_gateway_1.WorkflowGateway,
            expression_resolver_service_1.ExpressionResolverService,
            start_handler_1.StartNodeHandler,
            condition_handler_1.ConditionHandler,
            api_request_handler_1.ApiRequestHandler,
            notification_handler_1.NotificationHandler,
            save_data_handler_1.SaveDataHandler,
            transform_handler_1.TransformHandler,
            approval_handler_1.ApprovalHandler,
            switch_handler_1.SwitchHandler,
            loop_handler_1.LoopHandler,
            schedule_handler_1.ScheduleHandler
        ],
        exports: [workflows_service_1.WorkflowsService, workflow_runtime_service_1.WorkflowRuntimeService, workflow_orchestrator_service_1.WorkflowOrchestrator],
    }),
    __metadata("design:paramtypes", [workflow_runtime_service_1.WorkflowRuntimeService,
        start_handler_1.StartNodeHandler,
        condition_handler_1.ConditionHandler,
        api_request_handler_1.ApiRequestHandler,
        notification_handler_1.NotificationHandler,
        save_data_handler_1.SaveDataHandler,
        transform_handler_1.TransformHandler,
        approval_handler_1.ApprovalHandler,
        switch_handler_1.SwitchHandler,
        loop_handler_1.LoopHandler,
        schedule_handler_1.ScheduleHandler])
], WorkflowsModule);
//# sourceMappingURL=workflows.module.js.map