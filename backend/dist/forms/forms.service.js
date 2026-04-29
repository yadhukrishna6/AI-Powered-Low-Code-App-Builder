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
exports.FormsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let FormsService = class FormsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createFormDto) {
        return this.prisma.form.create({
            data: createFormDto,
        });
    }
    async findAll() {
        return this.prisma.form.findMany({
            orderBy: { createdAt: 'desc' },
        });
    }
    async findOne(id) {
        const form = await this.prisma.form.findUnique({
            where: { id },
        });
        if (!form) {
            throw new common_1.NotFoundException(`Form with ID "${id}" not found`);
        }
        return form;
    }
    async update(id, updateFormDto) {
        try {
            return await this.prisma.form.update({
                where: { id },
                data: updateFormDto,
            });
        }
        catch (error) {
            throw new common_1.NotFoundException(`Form with ID "${id}" not found`);
        }
    }
    async remove(id) {
        try {
            await this.prisma.form.delete({
                where: { id },
            });
            return { deleted: true };
        }
        catch (error) {
            throw new common_1.NotFoundException(`Form with ID "${id}" not found`);
        }
    }
};
exports.FormsService = FormsService;
exports.FormsService = FormsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], FormsService);
//# sourceMappingURL=forms.service.js.map