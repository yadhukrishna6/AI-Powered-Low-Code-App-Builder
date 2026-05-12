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
exports.ApprovalHandler = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../prisma/prisma.service");
let ApprovalHandler = class ApprovalHandler {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async execute(node, context) {
        const lastLog = await this.prisma.workflowLog.findFirst({
            where: {
                executionId: context.executionId,
                nodeId: node.id,
                status: 'waiting'
            },
            orderBy: { timestamp: 'desc' }
        });
        if (context.variables.__resume_action) {
            const action = context.variables.__resume_action;
            delete context.variables.__resume_action;
            return {
                status: 'success',
                nextPath: action === 'approve' ? 'approved' : 'rejected',
                output: {
                    lastApprovalStatus: action,
                    approvedBy: context.variables.__resume_user || 'system'
                }
            };
        }
        await this.prisma.approvalTask.create({
            data: {
                executionId: context.executionId,
                nodeId: node.id,
                approverRole: node.data.approverRole || 'admin',
                status: 'pending'
            }
        });
        return {
            status: 'waiting'
        };
    }
};
exports.ApprovalHandler = ApprovalHandler;
exports.ApprovalHandler = ApprovalHandler = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ApprovalHandler);
//# sourceMappingURL=approval.handler.js.map