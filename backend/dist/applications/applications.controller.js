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
exports.ApplicationsController = void 0;
const common_1 = require("@nestjs/common");
const applications_service_1 = require("./applications.service");
const crud_generator_service_1 = require("./crud-generator.service");
const ai_architect_service_1 = require("./ai-architect.service");
let ApplicationsController = class ApplicationsController {
    applicationsService;
    crudGenerator;
    aiArchitect;
    constructor(applicationsService, crudGenerator, aiArchitect) {
        this.applicationsService = applicationsService;
        this.crudGenerator = crudGenerator;
        this.aiArchitect = aiArchitect;
    }
    generateApp(projectId, data) {
        return this.aiArchitect.generateApplication(data.prompt);
    }
    generateCrud(projectId, data) {
        return this.crudGenerator.generateCrudPages(projectId, data.entityId);
    }
    getLayout(projectId) {
        return this.applicationsService.getAppLayout(projectId);
    }
    updateLayout(projectId, data) {
        return this.applicationsService.updateAppLayout(projectId, data);
    }
    getPages(projectId) {
        return this.applicationsService.getPages(projectId);
    }
    createPage(projectId, data) {
        return this.applicationsService.createPage(projectId, data);
    }
    updatePage(id, data) {
        return this.applicationsService.updatePage(id, data);
    }
    removePage(id) {
        return this.applicationsService.removePage(id);
    }
};
exports.ApplicationsController = ApplicationsController;
__decorate([
    (0, common_1.Post)('generate-app'),
    __param(0, (0, common_1.Query)('projectId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], ApplicationsController.prototype, "generateApp", null);
__decorate([
    (0, common_1.Post)('generate-crud'),
    __param(0, (0, common_1.Query)('projectId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], ApplicationsController.prototype, "generateCrud", null);
__decorate([
    (0, common_1.Get)('layout'),
    __param(0, (0, common_1.Query)('projectId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ApplicationsController.prototype, "getLayout", null);
__decorate([
    (0, common_1.Put)('layout'),
    __param(0, (0, common_1.Query)('projectId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], ApplicationsController.prototype, "updateLayout", null);
__decorate([
    (0, common_1.Get)('pages'),
    __param(0, (0, common_1.Query)('projectId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ApplicationsController.prototype, "getPages", null);
__decorate([
    (0, common_1.Post)('pages'),
    __param(0, (0, common_1.Query)('projectId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], ApplicationsController.prototype, "createPage", null);
__decorate([
    (0, common_1.Put)('pages/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], ApplicationsController.prototype, "updatePage", null);
__decorate([
    (0, common_1.Delete)('pages/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ApplicationsController.prototype, "removePage", null);
exports.ApplicationsController = ApplicationsController = __decorate([
    (0, common_1.Controller)('applications'),
    __metadata("design:paramtypes", [applications_service_1.ApplicationsService,
        crud_generator_service_1.CrudGeneratorService,
        ai_architect_service_1.AIArchitectService])
], ApplicationsController);
//# sourceMappingURL=applications.controller.js.map