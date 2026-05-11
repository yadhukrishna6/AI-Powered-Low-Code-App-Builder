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
let WorkflowsService = class WorkflowsService {
    prisma;
    runtime;
    constructor(prisma, runtime) {
        this.prisma = prisma;
        this.runtime = runtime;
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
                graph: data.graph || { nodes: [], edges: [] },
                status: data.status || 'draft',
                projectId: data.projectId,
            },
        });
        if (workflow.graph && typeof workflow.graph === 'object') {
            const graph = workflow.graph;
            graph.id = workflow.id;
            return this.prisma.workflow.update({
                where: { id: workflow.id },
                data: { graph },
            });
        }
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
        if (updateData.projectId !== undefined && updateData.projectId !== null) {
            const project = await this.prisma.project.findUnique({
                where: { id: updateData.projectId },
            });
            if (!project) {
                throw new common_1.NotFoundException(`Project ${updateData.projectId} not found`);
            }
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
    async remove(id) {
        return this.prisma.workflow.delete({
            where: { id },
        });
    }
    async createExecution(workflowId, triggerSource, context) {
        const workflow = await this.prisma.workflow.findUnique({
            where: { id: workflowId },
        });
        if (!workflow) {
            throw new common_1.NotFoundException(`Workflow ${workflowId} not found`);
        }
        const execution = await this.prisma.workflowExecution.create({
            data: {
                workflowId,
                triggerSource,
                context,
                status: 'queued',
            },
        });
        this.runtime.run(execution.id).catch(err => {
            console.error(`Workflow ${workflowId} failed to run:`, err);
        });
        return execution;
    }
    async getExecution(executionId) {
        return this.prisma.workflowExecution.findUnique({
            where: { id: executionId },
            include: {
                logs: true,
                workflow: {
                    select: { graph: true }
                }
            },
        });
    }
    async resumeExecution(executionId, action) {
        const execution = await this.prisma.workflowExecution.findUnique({
            where: { id: executionId },
            include: { workflow: true },
        });
        if (!execution || execution.status !== 'waiting') {
            throw new common_1.NotFoundException(`Execution ${executionId} not found or not waiting`);
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
        this.runtime.resume(executionId, action).catch(err => {
            console.error(`Workflow ${execution.workflowId} resume failed:`, err);
        });
        return { message: 'Execution resumed' };
    }
};
exports.WorkflowsService = WorkflowsService;
exports.WorkflowsService = WorkflowsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        workflow_runtime_service_1.WorkflowRuntimeService])
], WorkflowsService);
//# sourceMappingURL=workflows.service.js.map