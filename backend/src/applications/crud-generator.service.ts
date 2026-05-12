import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CrudGeneratorService {
  constructor(private prisma: PrismaService) {}

  async generateCrudPages(projectId: string, entityId: string) {
    const entity = await this.prisma.entity.findUnique({
      where: { id: entityId },
      include: { fields: true },
    });

    if (!entity) throw new Error('Entity not found');

    const baseRoute = `/${entity.name.toLowerCase()}s`;

    // 1. List Page
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

    // 2. Create Page
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
}
