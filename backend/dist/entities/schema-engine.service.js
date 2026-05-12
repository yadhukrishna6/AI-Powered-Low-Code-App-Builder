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
var SchemaEngineService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SchemaEngineService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let SchemaEngineService = SchemaEngineService_1 = class SchemaEngineService {
    prisma;
    logger = new common_1.Logger(SchemaEngineService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async generatePrismaSchema(projectId) {
        const entities = await this.prisma.entity.findMany({
            where: { projectId },
            include: { fields: true },
        });
        let schema = `// Generated for Project: ${projectId}\n\n`;
        for (const entity of entities) {
            schema += `model ${this.capitalize(entity.name)} {\n`;
            schema += `  id String @id @default(uuid())\n`;
            for (const field of entity.fields) {
                if (field.name === 'id')
                    continue;
                const type = this.mapToPrismaType(field.type);
                const modifier = field.isRequired ? '' : '?';
                const unique = field.isUnique ? ' @unique' : '';
                const defaultVal = field.defaultValue ? ` @default(${this.formatDefaultValue(field.defaultValue, field.type)})` : '';
                schema += `  ${field.name} ${type}${modifier}${unique}${defaultVal}\n`;
            }
            schema += `  createdAt DateTime @default(now())\n`;
            schema += `  updatedAt DateTime @updatedAt\n`;
            const eMeta = entity;
            if (eMeta.metadata?.indexes) {
                eMeta.metadata.indexes.forEach((idx) => {
                    schema += `  @@index([${idx.fields.join(', ')}])\n`;
                });
            }
            schema += `}\n\n`;
        }
        return schema;
    }
    capitalize(s) {
        return s.charAt(0).toUpperCase() + s.slice(1);
    }
    mapToPrismaType(type) {
        switch (type.toLowerCase()) {
            case 'text':
            case 'string': return 'String';
            case 'longtext':
            case 'richtext': return 'String';
            case 'int':
            case 'number': return 'Int';
            case 'decimal': return 'Decimal';
            case 'boolean': return 'Boolean';
            case 'datetime': return 'DateTime';
            case 'json': return 'Json';
            case 'uuid': return 'String';
            default: return 'String';
        }
    }
    formatDefaultValue(val, type) {
        if (type.toLowerCase() === 'string')
            return `"${val}"`;
        return val;
    }
};
exports.SchemaEngineService = SchemaEngineService;
exports.SchemaEngineService = SchemaEngineService = SchemaEngineService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SchemaEngineService);
//# sourceMappingURL=schema-engine.service.js.map