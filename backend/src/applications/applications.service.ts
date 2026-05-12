import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ApplicationsService {
  constructor(private prisma: PrismaService) {}

  async getAppLayout(projectId: string) {
    let layout = await this.prisma.appLayout.findUnique({
      where: { projectId },
    });

    if (!layout) {
      // Create default layout if none exists
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

  async updateAppLayout(projectId: string, data: any) {
    return this.prisma.appLayout.update({
      where: { projectId },
      data: {
        navigation: data.navigation,
        theme: data.theme,
        config: data.config,
      }
    });
  }

  async getPages(projectId: string) {
    return this.prisma.page.findMany({
      where: { projectId },
      orderBy: { createdAt: 'asc' },
    });
  }

  async createPage(projectId: string, data: any) {
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

  async updatePage(id: string, data: any) {
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

  async removePage(id: string) {
    return this.prisma.page.delete({ where: { id } });
  }
}
