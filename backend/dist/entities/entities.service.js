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
exports.EntitiesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let EntitiesService = class EntitiesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(projectId) {
        return this.prisma.entity.findMany({
            where: { projectId },
            include: { fields: true },
        });
    }
    async findOne(id) {
        const entity = await this.prisma.entity.findUnique({
            where: { id },
            include: { fields: true },
        });
        if (!entity)
            throw new common_1.NotFoundException(`Entity ${id} not found`);
        return entity;
    }
    async create(projectId, data) {
        return this.prisma.entity.create({
            data: {
                name: data.name,
                description: data.description,
                projectId,
                fields: {
                    create: data.fields || [],
                },
            },
            include: { fields: true },
        });
    }
    async update(id, data) {
        if (data.fields) {
            await this.prisma.field.deleteMany({ where: { entityId: id } });
        }
        return this.prisma.entity.update({
            where: { id },
            data: {
                name: data.name,
                description: data.description,
                fields: {
                    create: data.fields || [],
                },
            },
            include: { fields: true },
        });
    }
    async remove(id) {
        await this.prisma.field.deleteMany({ where: { entityId: id } });
        return this.prisma.entity.delete({ where: { id } });
    }
};
exports.EntitiesService = EntitiesService;
exports.EntitiesService = EntitiesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], EntitiesService);
//# sourceMappingURL=entities.service.js.map