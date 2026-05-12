import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class EntitiesService {
  constructor(private prisma: PrismaService) {}

  async findAll(projectId: string) {
    return this.prisma.entity.findMany({
      where: { projectId },
      include: { fields: true },
    });
  }

  async findOne(id: string) {
    const entity = await this.prisma.entity.findUnique({
      where: { id },
      include: { fields: true },
    });
    if (!entity) throw new NotFoundException(`Entity ${id} not found`);
    return entity;
  }

  async create(projectId: string, data: any) {
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

  async update(id: string, data: any) {
    // Delete existing fields and recreate (simple sync for metadata)
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

  async remove(id: string) {
    // Prisma will handle cascading if configured, but let's be explicit if needed
    await this.prisma.field.deleteMany({ where: { entityId: id } });
    return this.prisma.entity.delete({ where: { id } });
  }
}
