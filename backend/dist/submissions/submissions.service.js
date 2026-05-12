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
exports.SubmissionsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let SubmissionsService = class SubmissionsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createSubmissionDto) {
        const form = await this.prisma.form.findUnique({
            where: { id: createSubmissionDto.formId },
        });
        if (!form) {
            throw new common_1.NotFoundException(`Form with ID "${createSubmissionDto.formId}" not found`);
        }
        return this.prisma.submission.create({
            data: {
                formId: createSubmissionDto.formId,
                data: createSubmissionDto.data,
            },
        });
    }
    async findByForm(formId) {
        const form = await this.prisma.form.findUnique({
            where: { id: formId },
        });
        if (!form) {
            throw new common_1.NotFoundException(`Form with ID "${formId}" not found`);
        }
        return this.prisma.submission.findMany({
            where: { formId },
            orderBy: { createdAt: 'desc' },
        });
    }
    async findAll() {
        return this.prisma.submission.findMany({
            orderBy: { createdAt: 'desc' },
            include: { form: true }
        });
    }
    async findOne(id) {
        const submission = await this.prisma.submission.findUnique({
            where: { id },
            include: { form: true },
        });
        if (!submission) {
            throw new common_1.NotFoundException(`Submission with ID "${id}" not found`);
        }
        return submission;
    }
};
exports.SubmissionsService = SubmissionsService;
exports.SubmissionsService = SubmissionsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SubmissionsService);
//# sourceMappingURL=submissions.service.js.map