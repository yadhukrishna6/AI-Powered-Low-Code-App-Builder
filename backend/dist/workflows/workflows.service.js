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
exports.WorkflowsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const workflow_runtime_service_1 = require("./runtime/workflow-runtime.service");
const workflow_orchestrator_service_1 = require("./runtime/workflow-orchestrator.service");
const expression_resolver_service_1 = require("./runtime/expression-resolver.service");
let WorkflowsService = class WorkflowsService {
    prisma;
    runtime;
    orchestrator;
    expressionResolver;
    constructor(prisma, runtime, orchestrator, expressionResolver) {
        this.prisma = prisma;
        this.runtime = runtime;
        this.orchestrator = orchestrator;
        this.expressionResolver = expressionResolver;
    }
    async testNode(node, context) {
        const handler = this.runtime.getHandler(node.subType);
        if (!handler) {
            throw new common_1.BadRequestException(`No handler found for node type: ${node.subType}`);
        }
        const fullContext = {
            executionId: 'test-execution',
            workflowId: 'test-workflow',
            variables: context.variables || {},
            lastOutput: context.lastOutput || {},
            nodeOutputs: context.nodeOutputs || {},
        };
        const resolvedData = this.expressionResolver.resolve(node.data, fullContext);
        return await handler.execute({ ...node, data: resolvedData }, fullContext);
    }
    async create(data) {
        if (data.projectId) {
            const project = await this.prisma.project.findUnique({
                where: { id: data.projectId },
            });
            if (!project) {
                throw new common_1.NotFoundException(`Project ${data.projectId} not found`);
            }
        }
        const workflow = await this.prisma.workflow.create({
            data: {
                name: data.name,
                description: data.description,
                draftGraph: data.graph || { nodes: [], edges: [] },
                status: data.status || 'draft',
                projectId: data.projectId,
            },
        });
        return workflow;
    }
    async findAll(projectId) {
        return this.prisma.workflow.findMany({
            where: projectId ? { projectId } : {},
            orderBy: { updatedAt: 'desc' },
        });
    }
    async findOne(id) {
        const workflow = await this.prisma.workflow.findUnique({
            where: { id },
            include: {
                versions: {
                    orderBy: { version: 'desc' },
                    take: 5,
                },
                executions: {
                    take: 10,
                    orderBy: { startTime: 'desc' },
                },
            },
        });
        if (!workflow)
            throw new common_1.NotFoundException(`Workflow ${id} not found`);
        return workflow;
    }
    async update(id, data) {
        const updateData = { ...data };
        delete updateData.id;
        if (updateData.graph) {
            updateData.draftGraph = updateData.graph;
            delete updateData.graph;
        }
        try {
            return await this.prisma.workflow.update({
                where: { id },
                data: updateData,
            });
        }
        catch (error) {
            if (error.code === 'P2025') {
                throw new common_1.NotFoundException(`Workflow ${id} not found`);
            }
            throw error;
        }
    }
    async publish(id, metadata) {
        const workflow = await this.prisma.workflow.findUnique({
            where: { id },
            include: { versions: { orderBy: { version: 'desc' }, take: 1 } },
        });
        if (!workflow || !workflow.draftGraph) {
            throw new common_1.BadRequestException('Workflow not found or has no draft to publish');
        }
        const nextVersion = workflow.versions.length > 0 ? workflow.versions[0].version + 1 : 1;
        const version = await this.prisma.workflowVersion.create({
            data: {
                workflowId: id,
                version: nextVersion,
                graph: workflow.draftGraph,
                metadata: metadata || {},
            },
        });
        await this.prisma.workflow.update({
            where: { id },
            data: {
                activeVersionId: version.id,
                status: 'active',
            },
        });
        return version;
    }
    async remove(id) {
        return this.prisma.workflow.delete({
            where: { id },
        });
    }
    async createExecution(workflowId, triggerSource, context) {
        const workflow = await this.prisma.workflow.findUnique({
            where: { id: workflowId },
            include: { versions: true }
        });
        if (!workflow) {
            throw new common_1.NotFoundException(`Workflow ${workflowId} not found`);
        }
        const versionId = workflow.activeVersionId;
        if (!versionId) {
            throw new common_1.BadRequestException(`Workflow ${workflowId} has no active version published`);
        }
        const execution = await this.prisma.workflowExecution.create({
            data: {
                workflowId,
                versionId,
                triggerSource,
                context,
                status: 'queued',
            },
        });
        await this.orchestrator.startExecution(execution.id);
        return execution;
    }
    async getExecution(executionId) {
        return this.prisma.workflowExecution.findUnique({
            where: { id: executionId },
            include: {
                logs: true,
                version: {
                    select: { graph: true }
                }
            },
        });
    }
    async resumeExecution(executionId, action) {
        const execution = await this.prisma.workflowExecution.findUnique({
            where: { id: executionId },
        });
        if (!execution) {
            throw new common_1.NotFoundException(`Execution ${executionId} not found`);
        }
        if (execution.status !== 'waiting' && execution.status !== 'running' && execution.status !== 'active') {
            throw new common_1.BadRequestException(`Cannot resume execution ${executionId}. Current status is '${execution.status}', but it must be 'waiting' or 'active'.`);
        }
        await this.prisma.workflowExecution.update({
            where: { id: executionId },
            data: {
                status: 'running',
                context: {
                    ...(execution.context || {}),
                    resumeAction: action,
                },
            },
        });
        const executionLogs = await this.prisma.workflowLog.findMany({
            where: { executionId, status: 'waiting' },
            orderBy: { timestamp: 'desc' },
            take: 1
        });
        if (executionLogs.length > 0) {
            await this.orchestrator.queueNode(executionId, executionLogs[0].nodeId);
        }
        return { message: 'Execution resumed' };
    }
};
exports.WorkflowsService = WorkflowsService;
exports.WorkflowsService = WorkflowsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        workflow_runtime_service_1.WorkflowRuntimeService,
        workflow_orchestrator_service_1.WorkflowOrchestrator,
        expression_resolver_service_1.ExpressionResolverService])
], WorkflowsService);
//# sourceMappingURL=workflows.service.js.map