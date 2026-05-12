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
exports.ApplicationsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let ApplicationsService = class ApplicationsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getAppLayout(projectId) {
        let layout = await this.prisma.appLayout.findUnique({
            where: { projectId },
        });
        if (!layout) {
            layout = await this.prisma.appLayout.create({
                data: {
                    projectId,
                    navigation: {
                        sidebar: [
                            { label: 'Dashboard', route: '/dashboard', icon: 'dashboard' },
                            { label: 'Entities', route: '/entities', icon: 'table_chart' },
                        ],
                        topbar: []
                    },
                }
            });
        }
        return layout;
    }
    async updateAppLayout(projectId, data) {
        return this.prisma.appLayout.update({
            where: { projectId },
            data: {
                navigation: data.navigation,
                theme: data.theme,
                config: data.config,
            }
        });
    }
    async getPages(projectId) {
        return this.prisma.page.findMany({
            where: { projectId },
            orderBy: { createdAt: 'asc' },
        });
    }
    async createPage(projectId, data) {
        return this.prisma.page.create({
            data: {
                projectId,
                name: data.name,
                route: data.route,
                type: data.type,
                content: data.content || {},
                config: data.config || {},
            }
        });
    }
    async updatePage(id, data) {
        return this.prisma.page.update({
            where: { id },
            data: {
                name: data.name,
                route: data.route,
                type: data.type,
                content: data.content,
                config: data.config,
            }
        });
    }
    async removePage(id) {
        return this.prisma.page.delete({ where: { id } });
    }
};
exports.ApplicationsService = ApplicationsService;
exports.ApplicationsService = ApplicationsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ApplicationsService);
//# sourceMappingURL=applications.service.js.map