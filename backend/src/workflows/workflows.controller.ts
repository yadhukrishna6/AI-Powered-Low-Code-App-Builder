import { Controller, Get, Post, Body, Put, Param, Delete } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Controller('workflows')
export class WorkflowsController {
  constructor(private prisma: PrismaService) {}

  @Post()
  create(@Body() data: any) {
    return this.prisma.workflow.create({
      data: {
        name: data.name,
        graph: data.graph,
        status: data.status || 'draft',
        projectId: data.projectId
      }
    });
  }

  @Get()
  findAll() {
    return this.prisma.workflow.findMany();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.prisma.workflow.findUnique({
      where: { id }
    });
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() data: any) {
    return this.prisma.workflow.update({
      where: { id },
      data
    });
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.prisma.workflow.delete({
      where: { id }
    });
  }
}
