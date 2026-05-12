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
exports.CrudGeneratorService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let CrudGeneratorService = class CrudGeneratorService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async generateCrudPages(projectId, entityId) {
        const entity = await this.prisma.entity.findUnique({
            where: { id: entityId },
            include: { fields: true },
        });
        if (!entity)
            throw new Error('Entity not found');
        const baseRoute = `/${entity.name.toLowerCase()}s`;
        await this.prisma.page.create({
            data: {
                projectId,
                name: `${entity.name} List`,
                route: baseRoute,
                type: 'crud',
                content: {
                    component: 'DataGrid',
                    entityId: entity.id,
                    columns: entity.fields.map(f => ({ header: f.name, field: f.name })),
                    actions: ['view', 'edit', 'delete']
                }
            }
        });
        await this.prisma.page.create({
            data: {
                projectId,
                name: `New ${entity.name}`,
                route: `${baseRoute}/new`,
                type: 'form',
                content: {
                    component: 'AutoForm',
                    entityId: entity.id,
                    fields: entity.fields.map(f => ({ ...f, component: 'input' }))
                }
            }
        });
        return { success: true, baseRoute };
    }
};
exports.CrudGeneratorService = CrudGeneratorService;
exports.CrudGeneratorService = CrudGeneratorService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CrudGeneratorService);
//# sourceMappingURL=crud-generator.service.js.map