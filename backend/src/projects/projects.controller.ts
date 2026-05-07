import { Controller, Get, Post, Body, Put, Param, Delete } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Controller('projects')
export class ProjectsController {
  constructor(private prisma: PrismaService) {}

  @Post()
  create(@Body() data: any) {
    return this.prisma.project.create({ data });
  }

  @Get()
  findAll() {
    return this.prisma.project.findMany({
      include: {
        forms: true,
        _count: {
          select: { forms: true, workflows: true }
        }
      }
    });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.prisma.project.findUnique({
      where: { id },
      include: { forms: true, workflows: true }
    });
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() data: any) {
    return this.prisma.project.update({
      where: { id },
      data
    });
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.prisma.project.delete({
      where: { id }
    });
  }
}
