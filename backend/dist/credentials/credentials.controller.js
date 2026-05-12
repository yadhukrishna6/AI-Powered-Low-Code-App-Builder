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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CredentialsController = void 0;
const common_1 = require("@nestjs/common");
const credentials_service_1 = require("./credentials.service");
let CredentialsController = class CredentialsController {
    credentialsService;
    constructor(credentialsService) {
        this.credentialsService = credentialsService;
    }
    async create(orgId, body) {
        return this.credentialsService.create(orgId, body.name, body.type, body.data);
    }
    async findAll(orgId) {
        return this.credentialsService.findAll(orgId);
    }
    async findOne(id) {
        return this.credentialsService.findOne(id);
    }
    async remove(id) {
        return this.credentialsService.remove(id);
    }
};
exports.CredentialsController = CredentialsController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Query)('orgId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], CredentialsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('orgId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CredentialsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CredentialsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CredentialsController.prototype, "remove", null);
exports.CredentialsController = CredentialsController = __decorate([
    (0, common_1.Controller)('api/v1/credentials'),
    __metadata("design:paramtypes", [credentials_service_1.CredentialsService])
], CredentialsController);
//# sourceMappingURL=credentials.controller.js.map