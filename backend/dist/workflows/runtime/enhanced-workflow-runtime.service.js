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
var EnhancedWorkflowRuntimeService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnhancedWorkflowRuntimeService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let EnhancedWorkflowRuntimeService = EnhancedWorkflowRuntimeService_1 = class EnhancedWorkflowRuntimeService {
    prisma;
    logger = new common_1.Logger(EnhancedWorkflowRuntimeService_1.name);
    handlers = new Map();
    constructor(prisma) {
        this.prisma = prisma;
    }
    registerHandler(type, handler) {
        this.handlers.set(type, handler);
    }
    async executeWorkflow(workflowId, variables = {}) {
        const execution = await this.prisma.workflowExecution.create({
            data: {
                workflowId,
                status: 'running',
                context: variables,
                startTime: new Date()
            }
        });
        this.runExecution(execution.id).catch(err => {
            this.logger.error(`Execution ${execution.id} failed:`, err);
        });
        return execution.id;
    }
    async runExecution(executionId) {
        const execution = await this.prisma.workflowExecution.findUnique({
            where: { id: executionId },
            include: { workflow: true },
        });
        if (!execution)
            return;
        const graph = execution.workflow.graph;
        const context = {
            executionId,
            workflowId: execution.workflowId,
            variables: execution.context,
        };
        await this.initializeExecutionState(executionId, graph);
        let currentNode = graph.nodes.find((n) => n.type === 'trigger' || n.subType === 'start');
        while (currentNode) {
            await this.updateNodeExecutionState(executionId, currentNode.id, 'running');
            const handler = this.handlers.get(currentNode.subType);
            if (!handler) {
                await this.updateNodeExecutionState(executionId, currentNode.id, 'failed', `No handler found for ${currentNode.subType}`);
                await this.updateExecutionStatus(executionId, 'failed', context.variables);
                return;
            }
            try {
                const result = await handler.execute(currentNode, context);
                const nodeState = this.mapNodeResultToState(result.status);
                await this.updateNodeExecutionState(executionId, currentNode.id, nodeState, result.error, result.output, result.nextPath);
                if (result.status === 'failed') {
                    await this.updateExecutionStatus(executionId, 'failed', context.variables);
                    return;
                }
                if (result.status === 'waiting') {
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
                        await this.updateNodeExecutionState(executionId, currentNode.id, 'failed', `No outgoing edge found for branch ${result.nextPath}`);
                        await this.updateExecutionStatus(executionId, 'failed', context.variables);
                        return;
                    }
                }
                else {
                    edge = edges[0];
                }
                if (!edge)
                    break;
                await this.updateEdgeExecutionState(executionId, edge.id, 'active', result.nextPath);
                currentNode = graph.nodes.find((n) => n.id === edge.target);
            }
            catch (error) {
                this.logger.error(`Error in node ${currentNode.id}: ${error.message}`);
                await this.updateNodeExecutionState(executionId, currentNode.id, 'failed', error.message);
                await this.updateExecutionStatus(executionId, 'failed', context.variables);
                return;
            }
        }
        await this.updateExecutionStatus(executionId, 'success', context.variables);
    }
    async resumeExecution(executionId, action) {
        const execution = await this.prisma.workflowExecution.findUnique({
            where: { id: executionId },
            include: { workflow: true },
        });
        if (!execution || execution.status !== 'waiting') {
            throw new Error('Execution not in waiting state');
        }
        await this.prisma.workflowExecution.update({
            where: { id: executionId },
            data: {
                status: 'running',
                context: {
                    ...execution.context,
                    resumeAction: action,
                },
            },
        });
        await this.resumeFromWaitingNode(executionId, action);
    }
    async resumeFromWaitingNode(executionId, action) {
        const execution = await this.prisma.workflowExecution.findUnique({
            where: { id: executionId },
            include: { workflow: true },
        });
        if (!execution)
            return;
        const waitingLog = await this.prisma.workflowLog.findFirst({
            where: { executionId, status: 'waiting' },
            orderBy: { timestamp: 'desc' },
        });
        if (!waitingLog)
            return;
        const graph = execution.workflow.graph;
        const context = {
            executionId,
            workflowId: execution.workflowId,
            variables: { ...execution.context, resumeAction: action },
        };
        let currentNode = graph.nodes.find((n) => n.id === waitingLog.nodeId);
        if (!currentNode)
            return;
        await this.continueExecutionFromNode(executionId, currentNode, context, graph);
    }
    async continueExecutionFromNode(executionId, currentNode, context, graph) {
        while (currentNode) {
            await this.updateNodeExecutionState(executionId, currentNode.id, 'running');
            const handler = this.handlers.get(currentNode.subType);
            if (!handler) {
                await this.updateNodeExecutionState(executionId, currentNode.id, 'failed', `No handler found for ${currentNode.subType}`);
                await this.updateExecutionStatus(executionId, 'failed', context.variables);
                return;
            }
            try {
                const result = await handler.execute(currentNode, context);
                const nodeState = this.mapNodeResultToState(result.status);
                await this.updateNodeExecutionState(executionId, currentNode.id, nodeState, result.error, result.output, result.nextPath);
                if (result.status === 'failed') {
                    await this.updateExecutionStatus(executionId, 'failed', context.variables);
                    return;
                }
                if (result.status === 'waiting') {
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
                        await this.updateNodeExecutionState(executionId, currentNode.id, 'failed', `No outgoing edge found for branch ${result.nextPath}`);
                        await this.updateExecutionStatus(executionId, 'failed', context.variables);
                        return;
                    }
                }
                else {
                    edge = edges[0];
                }
                if (!edge)
                    break;
                await this.updateEdgeExecutionState(executionId, edge.id, 'active', result.nextPath);
                currentNode = graph.nodes.find((n) => n.id === edge.target);
            }
            catch (error) {
                this.logger.error(`Error in node ${currentNode.id}: ${error.message}`);
                await this.updateNodeExecutionState(executionId, currentNode.id, 'failed', error.message);
                await this.updateExecutionStatus(executionId, 'failed', context.variables);
                return;
            }
        }
        await this.updateExecutionStatus(executionId, 'success', context.variables);
    }
    async initializeExecutionState(executionId, graph) {
        const nodeStates = graph.nodes.map((node) => ({
            executionId,
            nodeId: node.id,
            state: 'idle',
            startedAt: null,
            completedAt: null,
            duration: null,
            error: null,
            retryCount: 0,
            output: null,
            input: null,
            branchTaken: null
        }));
        const edgeStates = graph.edges.map((edge) => ({
            executionId,
            edgeId: edge.id,
            state: 'inactive',
            executedAt: null,
            executionCount: 0,
            branchType: edge.sourceAnchor || edge.label || null
        }));
        await this.prisma.executionNodeState.createMany({ data: nodeStates });
        await this.prisma.executionEdgeState.createMany({ data: edgeStates });
    }
    async updateNodeExecutionState(executionId, nodeId, state, error, output, branchTaken) {
        const now = new Date();
        await this.prisma.executionNodeState.upsert({
            where: {
                executionId_nodeId: { executionId, nodeId }
            },
            update: {
                state,
                completedAt: ['success', 'failed', 'skipped', 'cancelled'].includes(state) ? now : null,
                duration: state === 'running' ? null : undefined,
                error,
                output,
                branchTaken
            },
            create: {
                executionId,
                nodeId,
                state,
                startedAt: state === 'running' ? now : null,
                completedAt: ['success', 'failed', 'skipped', 'cancelled'].includes(state) ? now : null,
                error,
                output,
                branchTaken
            }
        });
        await this.prisma.workflowLog.create({
            data: {
                executionId,
                nodeId,
                nodeType: 'unknown',
                status: state,
                input: null,
                output,
                error
            }
        });
    }
    async updateEdgeExecutionState(executionId, edgeId, state, branchType) {
        await this.prisma.executionEdgeState.upsert({
            where: {
                executionId_edgeId: { executionId, edgeId }
            },
            update: {
                state,
                executedAt: new Date(),
                executionCount: { increment: 1 },
                branchType
            },
            create: {
                executionId,
                edgeId,
                state,
                executedAt: new Date(),
                executionCount: 1,
                branchType
            }
        });
    }
    async updateExecutionStatus(executionId, status, context) {
        await this.prisma.workflowExecution.update({
            where: { id: executionId },
            data: {
                status,
                context,
                endTime: ['success', 'failed'].includes(status) ? new Date() : null
            },
        });
    }
    mapNodeResultToState(resultStatus) {
        switch (resultStatus) {
            case 'success': return 'success';
            case 'failed': return 'failed';
            case 'waiting': return 'waiting';
            case 'skipped': return 'skipped';
            default: return 'idle';
        }
    }
    async getExecutionState(executionId) {
        const execution = await this.prisma.workflowExecution.findUnique({
            where: { id: executionId },
            include: {
                nodeStates: true,
                edgeStates: true
            }
        });
        if (!execution)
            return null;
        return {
            executionId: execution.id,
            workflowId: execution.workflowId,
            status: execution.status,
            startedAt: execution.startTime,
            completedAt: execution.endTime || undefined,
            currentNodeId: execution.nodeStates.find(s => s.state === 'running')?.nodeId,
            nodeStates: execution.nodeStates.map(s => ({
                nodeId: s.nodeId,
                state: s.state,
                startedAt: s.startedAt || undefined,
                completedAt: s.completedAt || undefined,
                duration: s.duration || undefined,
                error: s.error || undefined,
                retryCount: s.retryCount,
                output: s.output,
                input: s.input,
                branchTaken: s.branchTaken || undefined
            })),
            edgeStates: execution.edgeStates.map(s => ({
                edgeId: s.edgeId,
                state: s.state,
                executedAt: s.executedAt || undefined,
                executionCount: s.executionCount,
                branchType: s.branchType || undefined
            })),
            variables: execution.context,
            progress: this.calculateProgress(execution.nodeStates)
        };
    }
    calculateProgress(nodeStates) {
        if (nodeStates.length === 0)
            return 0;
        const completedStates = ['success', 'failed', 'skipped'];
        const completed = nodeStates.filter(s => completedStates.includes(s.state)).length;
        return Math.round((completed / nodeStates.length) * 100);
    }
};
exports.EnhancedWorkflowRuntimeService = EnhancedWorkflowRuntimeService;
exports.EnhancedWorkflowRuntimeService = EnhancedWorkflowRuntimeService = EnhancedWorkflowRuntimeService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], EnhancedWorkflowRuntimeService);
//# sourceMappingURL=enhanced-workflow-runtime.service.js.map