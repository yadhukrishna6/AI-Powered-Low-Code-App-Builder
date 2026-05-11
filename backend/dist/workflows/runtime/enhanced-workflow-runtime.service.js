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
const client_1 = require("@prisma/client");
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
        const nodeStates = graph.nodes.map((node) => ({
            nodeId: node.id,
            state: 'idle',
            retryCount: 0,
        }));
        const edgeStates = graph.edges.map((edge) => ({
            edgeId: edge.id,
            state: 'inactive',
            executionCount: 0,
            branchType: edge.sourceAnchor || edge.label || undefined,
        }));
        await this.persistStateSnapshot(executionId, nodeStates, edgeStates);
        let currentNode = graph.nodes.find((n) => n.type === 'trigger' || n.subType === 'start');
        while (currentNode) {
            this.setNodeState(nodeStates, currentNode.id, 'running', { startedAt: new Date() });
            await this.persistStateSnapshot(executionId, nodeStates, edgeStates);
            const handler = this.handlers.get(currentNode.subType);
            if (!handler) {
                this.setNodeState(nodeStates, currentNode.id, 'failed', {
                    error: `No handler found for ${currentNode.subType}`
                });
                await this.persistStateSnapshot(executionId, nodeStates, edgeStates);
                await this.updateExecutionStatus(executionId, 'failed', context.variables);
                return;
            }
            try {
                const result = await handler.execute(currentNode, context);
                const nodeState = this.mapNodeResultToState(result.status);
                this.setNodeState(nodeStates, currentNode.id, nodeState, {
                    completedAt: ['success', 'failed', 'skipped', 'cancelled'].includes(nodeState) ? new Date() : undefined,
                    error: result.error,
                    output: result.output,
                    branchTaken: result.nextPath,
                });
                await this.logNode(executionId, currentNode, nodeState, result.output, result.error);
                await this.persistStateSnapshot(executionId, nodeStates, edgeStates);
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
                        this.setNodeState(nodeStates, currentNode.id, 'failed', {
                            error: `No outgoing edge found for branch ${result.nextPath}`
                        });
                        await this.persistStateSnapshot(executionId, nodeStates, edgeStates);
                        await this.updateExecutionStatus(executionId, 'failed', context.variables);
                        return;
                    }
                }
                else {
                    edge = edges[0];
                }
                if (!edge)
                    break;
                this.setEdgeState(edgeStates, edge.id, 'active', result.nextPath);
                await this.persistStateSnapshot(executionId, nodeStates, edgeStates);
                currentNode = graph.nodes.find((n) => n.id === edge.target);
            }
            catch (error) {
                this.logger.error(`Error in node ${currentNode.id}: ${error.message}`);
                this.setNodeState(nodeStates, currentNode.id, 'failed', { error: error.message });
                await this.persistStateSnapshot(executionId, nodeStates, edgeStates);
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
        const snapshot = execution.result;
        const nodeStates = snapshot?.nodeStates || [];
        const edgeStates = snapshot?.edgeStates || [];
        let currentNode = graph.nodes.find((n) => n.id === waitingLog.nodeId);
        if (!currentNode)
            return;
        await this.continueExecutionFromNode(executionId, currentNode, context, graph, nodeStates, edgeStates);
    }
    async continueExecutionFromNode(executionId, currentNode, context, graph, nodeStates, edgeStates) {
        while (currentNode) {
            this.setNodeState(nodeStates, currentNode.id, 'running', { startedAt: new Date() });
            await this.persistStateSnapshot(executionId, nodeStates, edgeStates);
            const handler = this.handlers.get(currentNode.subType);
            if (!handler) {
                this.setNodeState(nodeStates, currentNode.id, 'failed', {
                    error: `No handler found for ${currentNode.subType}`
                });
                await this.persistStateSnapshot(executionId, nodeStates, edgeStates);
                await this.updateExecutionStatus(executionId, 'failed', context.variables);
                return;
            }
            try {
                const result = await handler.execute(currentNode, context);
                const nodeState = this.mapNodeResultToState(result.status);
                this.setNodeState(nodeStates, currentNode.id, nodeState, {
                    completedAt: ['success', 'failed', 'skipped', 'cancelled'].includes(nodeState) ? new Date() : undefined,
                    error: result.error,
                    output: result.output,
                    branchTaken: result.nextPath,
                });
                await this.logNode(executionId, currentNode, nodeState, result.output, result.error);
                await this.persistStateSnapshot(executionId, nodeStates, edgeStates);
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
                        this.setNodeState(nodeStates, currentNode.id, 'failed', {
                            error: `No outgoing edge found for branch ${result.nextPath}`
                        });
                        await this.persistStateSnapshot(executionId, nodeStates, edgeStates);
                        await this.updateExecutionStatus(executionId, 'failed', context.variables);
                        return;
                    }
                }
                else {
                    edge = edges[0];
                }
                if (!edge)
                    break;
                this.setEdgeState(edgeStates, edge.id, 'active', result.nextPath);
                await this.persistStateSnapshot(executionId, nodeStates, edgeStates);
                currentNode = graph.nodes.find((n) => n.id === edge.target);
            }
            catch (error) {
                this.logger.error(`Error in node ${currentNode.id}: ${error.message}`);
                this.setNodeState(nodeStates, currentNode.id, 'failed', { error: error.message });
                await this.persistStateSnapshot(executionId, nodeStates, edgeStates);
                await this.updateExecutionStatus(executionId, 'failed', context.variables);
                return;
            }
        }
        await this.updateExecutionStatus(executionId, 'success', context.variables);
    }
    setNodeState(states, nodeId, state, extra = {}) {
        const existing = states.find(s => s.nodeId === nodeId);
        if (existing) {
            Object.assign(existing, { state, ...extra });
        }
        else {
            states.push({ nodeId, state, retryCount: 0, ...extra });
        }
    }
    setEdgeState(states, edgeId, state, branchType) {
        const existing = states.find(s => s.edgeId === edgeId);
        if (existing) {
            existing.state = state;
            existing.executedAt = new Date();
            existing.executionCount = (existing.executionCount || 0) + 1;
            if (branchType)
                existing.branchType = branchType;
        }
        else {
            states.push({ edgeId, state, executedAt: new Date(), executionCount: 1, branchType });
        }
    }
    async persistStateSnapshot(executionId, nodeStates, edgeStates) {
        await this.prisma.workflowExecution.update({
            where: { id: executionId },
            data: {
                result: { nodeStates, edgeStates },
            },
        });
    }
    async logNode(executionId, node, status, output, error) {
        await this.prisma.workflowLog.create({
            data: {
                executionId,
                nodeId: node.id,
                nodeType: node.subType || 'unknown',
                status,
                input: client_1.Prisma.JsonNull,
                output: output ? output : client_1.Prisma.JsonNull,
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
        });
        if (!execution)
            return null;
        const snapshot = execution.result || { nodeStates: [], edgeStates: [] };
        const nodeStates = snapshot.nodeStates || [];
        const edgeStates = snapshot.edgeStates || [];
        return {
            executionId: execution.id,
            workflowId: execution.workflowId,
            status: execution.status,
            startedAt: execution.startTime,
            completedAt: execution.endTime || undefined,
            currentNodeId: nodeStates.find(s => s.state === 'running')?.nodeId,
            nodeStates,
            edgeStates,
            variables: execution.context,
            progress: this.calculateProgress(nodeStates)
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