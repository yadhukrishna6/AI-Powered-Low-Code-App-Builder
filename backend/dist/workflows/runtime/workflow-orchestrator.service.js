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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var WorkflowOrchestrator_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkflowOrchestrator = void 0;
const common_1 = require("@nestjs/common");
const bullmq_1 = require("@nestjs/bullmq");
const bullmq_2 = require("bullmq");
const prisma_service_1 = require("../../prisma/prisma.service");
let WorkflowOrchestrator = WorkflowOrchestrator_1 = class WorkflowOrchestrator {
    workflowQueue;
    prisma;
    logger = new common_1.Logger(WorkflowOrchestrator_1.name);
    constructor(workflowQueue, prisma) {
        this.workflowQueue = workflowQueue;
        this.prisma = prisma;
    }
    async startExecution(executionId) {
        const execution = await this.prisma.workflowExecution.findUnique({
            where: { id: executionId },
            include: { version: true },
        });
        if (!execution || !execution.version) {
            throw new Error(`Execution ${executionId} or version not found`);
        }
        const graph = execution.version.graph;
        const startNode = graph.nodes.find((n) => n.type === 'trigger' || n.subType === 'start' || n.subType === 'form-submitted');
        if (!startNode) {
            throw new Error('No trigger node found in workflow graph');
        }
        this.logger.log(`Queueing trigger node ${startNode.id} for execution ${executionId}`);
        await this.workflowQueue.add('execute-node', {
            executionId,
            nodeId: startNode.id,
        }, {
            jobId: `${executionId}-${startNode.id}`,
            removeOnComplete: true,
            attempts: 3,
            backoff: {
                type: 'exponential',
                delay: 1000,
            },
        });
    }
    async queueNode(executionId, nodeId, delay = 0) {
        await this.workflowQueue.add('execute-node', {
            executionId,
            nodeId,
        }, {
            jobId: `${executionId}-${nodeId}-${Date.now()}`,
            delay,
            removeOnComplete: true,
        });
    }
};
exports.WorkflowOrchestrator = WorkflowOrchestrator;
exports.WorkflowOrchestrator = WorkflowOrchestrator = WorkflowOrchestrator_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, bullmq_1.InjectQueue)('workflow-queue')),
    __metadata("design:paramtypes", [bullmq_2.Queue,
        prisma_service_1.PrismaService])
], WorkflowOrchestrator);
//# sourceMappingURL=workflow-orchestrator.service.js.map