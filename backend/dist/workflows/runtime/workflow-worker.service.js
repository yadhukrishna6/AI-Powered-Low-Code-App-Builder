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
var WorkflowWorker_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkflowWorker = void 0;
const bullmq_1 = require("@nestjs/bullmq");
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const workflow_runtime_service_1 = require("./workflow-runtime.service");
const workflow_orchestrator_service_1 = require("./workflow-orchestrator.service");
const workflow_gateway_1 = require("./workflow.gateway");
const expression_resolver_service_1 = require("./expression-resolver.service");
let WorkflowWorker = WorkflowWorker_1 = class WorkflowWorker extends bullmq_1.WorkerHost {
    prisma;
    runtime;
    orchestrator;
    gateway;
    expressionResolver;
    logger = new common_1.Logger(WorkflowWorker_1.name);
    constructor(prisma, runtime, orchestrator, gateway, expressionResolver) {
        super();
        this.prisma = prisma;
        this.runtime = runtime;
        this.orchestrator = orchestrator;
        this.gateway = gateway;
        this.expressionResolver = expressionResolver;
    }
    async process(job) {
        const { executionId, nodeId } = job.data;
        this.logger.log(`Processing node ${nodeId} for execution ${executionId}`);
        const execution = await this.prisma.workflowExecution.findUnique({
            where: { id: executionId },
            include: { version: true },
        });
        if (!execution || !execution.version)
            return;
        if (execution.status === 'queued') {
            await this.prisma.workflowExecution.update({
                where: { id: executionId },
                data: { status: 'running' },
            });
        }
        const graph = execution.version.graph;
        const node = graph.nodes.find((n) => n.id === nodeId);
        if (!node) {
            this.logger.error(`Node ${nodeId} not found in graph`);
            return;
        }
        this.gateway.sendNodeExecutionUpdate(executionId, nodeId, 'running');
        const context = {
            executionId,
            workflowId: execution.workflowId,
            variables: execution.context,
            lastOutput: execution.lastOutput || {},
            nodeOutputs: execution.nodeOutputs || {},
        };
        const resolvedData = this.expressionResolver.resolve(node.data, context);
        try {
            const handler = this.runtime.getHandler(node.subType);
            if (!handler) {
                throw new Error(`No handler found for ${node.subType}`);
            }
            const result = await handler.execute({ ...node, data: resolvedData }, context);
            this.gateway.sendNodeExecutionUpdate(executionId, nodeId, result.status, result.output);
            if (result.status === 'retry') {
                this.logger.log(`Node ${nodeId} requested retry. Queueing with delay ${result.retryDelay || 1000}ms`);
                if (result.output) {
                    await this.prisma.workflowExecution.update({
                        where: { id: executionId },
                        data: { context: { ...context.variables, ...result.output } },
                    });
                }
                await this.orchestrator.queueNode(executionId, nodeId, result.retryDelay || 1000);
                return;
            }
            await this.prisma.workflowLog.create({
                data: {
                    executionId,
                    nodeId: node.id,
                    nodeType: node.subType,
                    status: result.status,
                    input: node.data || {},
                    output: result.output || {},
                    error: result.error,
                },
            });
            if (result.status === 'failed') {
                const edges = graph.edges.filter((e) => e.source === nodeId);
                const failureEdge = edges.find((e) => e.sourceHandle === 'failure' || e.sourceAnchor === 'failure');
                if (failureEdge) {
                    this.logger.log(`Node ${nodeId} failed. Redirecting to failure branch.`);
                    await this.orchestrator.queueNode(executionId, failureEdge.target);
                    return;
                }
                await this.prisma.workflowExecution.update({
                    where: { id: executionId },
                    data: { status: 'failed' },
                });
                this.gateway.sendExecutionStatusUpdate(executionId, 'failed');
                return;
            }
            if (result.status === 'waiting') {
                await this.prisma.workflowExecution.update({
                    where: { id: executionId },
                    data: { status: 'waiting' },
                });
                this.gateway.sendExecutionStatusUpdate(executionId, 'waiting');
                return;
            }
            if (result.output) {
                const updatedVariables = { ...context.variables, ...result.output };
                await this.prisma.workflowExecution.update({
                    where: { id: executionId },
                    data: { context: updatedVariables },
                });
            }
            const edges = graph.edges.filter((e) => e.source === nodeId);
            let nextEdges = [];
            if (result.nextPath) {
                nextEdges = edges.filter((e) => e.sourceHandle === result.nextPath || e.sourceAnchor === result.nextPath);
            }
            else {
                nextEdges = edges.filter((e) => !e.sourceHandle || (e.sourceHandle !== 'failure' && e.sourceHandle !== 'false' && e.sourceHandle !== 'rejected')).slice(0, 1);
            }
            for (const edge of nextEdges) {
                await this.orchestrator.queueNode(executionId, edge.target);
            }
            if (nextEdges.length === 0) {
                await this.prisma.workflowExecution.update({
                    where: { id: executionId },
                    data: {
                        status: 'success',
                        endTime: new Date()
                    },
                });
                this.gateway.sendExecutionStatusUpdate(executionId, 'success');
            }
        }
        catch (error) {
            this.logger.error(`Error executing node ${nodeId}: ${error.message}`);
            await this.prisma.workflowLog.create({
                data: {
                    executionId,
                    nodeId: node.id,
                    nodeType: node.subType,
                    status: 'failed',
                    error: error.message,
                },
            });
            const edges = graph.edges.filter((e) => e.source === nodeId);
            const failureEdge = edges.find((e) => e.sourceHandle === 'failure' || e.sourceAnchor === 'failure');
            if (failureEdge) {
                this.logger.log(`Exception in node ${nodeId}. Redirecting to failure branch.`);
                await this.orchestrator.queueNode(executionId, failureEdge.target);
                return;
            }
            await this.prisma.workflowExecution.update({
                where: { id: executionId },
                data: { status: 'failed', endTime: new Date() },
            });
            this.gateway.sendExecutionStatusUpdate(executionId, 'failed');
            throw error;
        }
    }
};
exports.WorkflowWorker = WorkflowWorker;
exports.WorkflowWorker = WorkflowWorker = WorkflowWorker_1 = __decorate([
    (0, bullmq_1.Processor)('workflow-queue'),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        workflow_runtime_service_1.WorkflowRuntimeService,
        workflow_orchestrator_service_1.WorkflowOrchestrator,
        workflow_gateway_1.WorkflowGateway,
        expression_resolver_service_1.ExpressionResolverService])
], WorkflowWorker);
//# sourceMappingURL=workflow-worker.service.js.map