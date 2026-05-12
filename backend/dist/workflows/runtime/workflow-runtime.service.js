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
var WorkflowRuntimeService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkflowRuntimeService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let WorkflowRuntimeService = WorkflowRuntimeService_1 = class WorkflowRuntimeService {
    prisma;
    logger = new common_1.Logger(WorkflowRuntimeService_1.name);
    handlers = new Map();
    constructor(prisma) {
        this.prisma = prisma;
    }
    registerHandler(type, handler) {
        this.handlers.set(type, handler);
    }
    getHandler(type) {
        return this.handlers.get(type);
    }
    async run(executionId) {
        const execution = await this.prisma.workflowExecution.findUnique({
            where: { id: executionId },
            include: { version: true },
        });
        if (!execution || !execution.version) {
            this.logger.error(`Execution ${executionId} or its version not found`);
            return;
        }
        await this.prisma.workflowExecution.update({
            where: { id: executionId },
            data: { status: 'running' },
        });
        const graph = execution.version.graph;
        const context = {
            executionId,
            workflowId: execution.workflowId,
            variables: execution.context,
        };
        let currentNode = graph.nodes.find((n) => n.type === 'trigger' || n.subType === 'start');
        while (currentNode) {
            this.logger.log(`Executing node: ${currentNode.id} (${currentNode.subType})`);
            const handler = this.handlers.get(currentNode.subType);
            if (!handler) {
                await this.logNode(executionId, currentNode, 'failed', null, null, `No handler found for ${currentNode.subType}`);
                break;
            }
            try {
                const result = await handler.execute(currentNode, context);
                await this.logNode(executionId, currentNode, result.status, null, result.output, result.error);
                if (result.status === 'failed') {
                    await this.updateExecutionStatus(executionId, 'failed', context.variables);
                    return;
                }
                if (result.status === 'waiting') {
                    this.logger.log(`Workflow ${executionId} reached a waiting state at node ${currentNode.id}`);
                    await this.updateExecutionStatus(executionId, 'waiting', context.variables);
                    return;
                }
                if (result.output) {
                    context.variables = { ...context.variables, ...result.output };
                }
                const edges = graph.edges.filter((e) => e.source === currentNode.id);
                if (edges.length === 0)
                    break;
                let edge;
                if (result.nextPath) {
                    edge = edges.find((e) => e.sourceHandle === result.nextPath || e.sourceAnchor === result.nextPath);
                    if (!edge) {
                        await this.logNode(executionId, currentNode, 'failed', null, null, `No outgoing edge found for branch ${result.nextPath}`);
                        await this.updateExecutionStatus(executionId, 'failed', context.variables);
                        return;
                    }
                }
                else {
                    edge = edges[0];
                }
                if (!edge)
                    break;
                currentNode = graph.nodes.find((n) => n.id === edge.target);
            }
            catch (error) {
                this.logger.error(`Error in node ${currentNode.id}: ${error.message}`);
                await this.logNode(executionId, currentNode, 'failed', null, null, error.message);
                await this.updateExecutionStatus(executionId, 'failed', context.variables);
                return;
            }
        }
        await this.updateExecutionStatus(executionId, 'success', context.variables);
    }
    async logNode(executionId, node, status, input, output, error) {
        await this.prisma.workflowLog.create({
            data: {
                executionId,
                nodeId: node.id,
                nodeType: node.subType,
                status,
                input: input || {},
                output: output || {},
                error,
            },
        });
    }
    async updateExecutionStatus(executionId, status, context) {
        await this.prisma.workflowExecution.update({
            where: { id: executionId },
            data: {
                status,
                context,
                endTime: status === 'success' || status === 'failed' ? new Date() : null
            },
        });
    }
    async resume(executionId, action) {
        const execution = await this.prisma.workflowExecution.findUnique({
            where: { id: executionId },
            include: { version: true },
        });
        if (!execution || !execution.version)
            return;
        if (execution.status !== 'waiting' && execution.status !== 'running' && execution.status !== 'active')
            return;
        const graph = execution.version.graph;
        const context = {
            executionId,
            workflowId: execution.workflowId,
            variables: { ...execution.context, resumeAction: action },
        };
        const lastLog = await this.prisma.workflowLog.findFirst({
            where: { executionId, status: 'waiting' },
            orderBy: { timestamp: 'desc' },
        });
        if (!lastLog)
            return;
        let currentNode = graph.nodes.find((n) => n.id === lastLog.nodeId);
        if (!currentNode)
            return;
        while (currentNode) {
            this.logger.log(`Resuming node: ${currentNode.id} (${currentNode.subType})`);
            const handler = this.handlers.get(currentNode.subType);
            if (!handler) {
                await this.logNode(executionId, currentNode, 'failed', null, null, `No handler found for ${currentNode.subType}`);
                break;
            }
            try {
                const result = await handler.execute(currentNode, context);
                await this.logNode(executionId, currentNode, result.status, null, result.output, result.error);
                if (result.status === 'failed') {
                    await this.updateExecutionStatus(executionId, 'failed', context.variables);
                    return;
                }
                if (result.output) {
                    context.variables = { ...context.variables, ...result.output };
                }
                const edges = graph.edges.filter((e) => e.source === currentNode.id);
                if (edges.length === 0)
                    break;
                let edge;
                if (result.nextPath) {
                    edge = edges.find((e) => e.sourceHandle === result.nextPath || e.sourceAnchor === result.nextPath);
                    if (!edge) {
                        await this.logNode(executionId, currentNode, 'failed', null, null, `No outgoing edge found for branch ${result.nextPath}`);
                        await this.updateExecutionStatus(executionId, 'failed', context.variables);
                        return;
                    }
                }
                else {
                    edge = edges[0];
                }
                if (!edge)
                    break;
                currentNode = graph.nodes.find((n) => n.id === edge.target);
            }
            catch (error) {
                this.logger.error(`Error in node ${currentNode.id}: ${error.message}`);
                await this.logNode(executionId, currentNode, 'failed', null, null, error.message);
                await this.updateExecutionStatus(executionId, 'failed', context.variables);
                return;
            }
        }
        await this.updateExecutionStatus(executionId, 'success', context.variables);
    }
};
exports.WorkflowRuntimeService = WorkflowRuntimeService;
exports.WorkflowRuntimeService = WorkflowRuntimeService = WorkflowRuntimeService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], WorkflowRuntimeService);
//# sourceMappingURL=workflow-runtime.service.js.map