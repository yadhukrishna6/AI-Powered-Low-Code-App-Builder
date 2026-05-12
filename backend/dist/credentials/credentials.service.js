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
exports.CredentialsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const encryption_service_1 = require("./encryption.service");
let CredentialsService = class CredentialsService {
    prisma;
    encryption;
    constructor(prisma, encryption) {
        this.prisma = prisma;
        this.encryption = encryption;
    }
    async create(orgId, name, type, rawData) {
        const encryptedData = this.encryption.encrypt(JSON.stringify(rawData));
        return this.prisma.credential.create({
            data: {
                orgId,
                name,
                type,
                data: encryptedData,
            },
        });
    }
    async findAll(orgId) {
        const credentials = await this.prisma.credential.findMany({
            where: { orgId },
            select: {
                id: true,
                name: true,
                type: true,
                createdAt: true,
                updatedAt: true,
            },
        });
        return credentials;
    }
    async findOne(id) {
        const credential = await this.prisma.credential.findUnique({
            where: { id },
        });
        if (!credential)
            throw new common_1.NotFoundException('Credential not found');
        return credential;
    }
    async getDecrypted(id) {
        const credential = await this.findOne(id);
        const decryptedData = this.encryption.decrypt(credential.data);
        return JSON.parse(decryptedData);
    }
    async remove(id) {
        return this.prisma.credential.delete({ where: { id } });
    }
};
exports.CredentialsService = CredentialsService;
exports.CredentialsService = CredentialsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        encryption_service_1.EncryptionService])
], CredentialsService);
//# sourceMappingURL=credentials.service.js.map