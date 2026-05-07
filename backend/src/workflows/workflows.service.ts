import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { WorkflowRuntimeService } from './runtime/workflow-runtime.service';

@Injectable()
export class WorkflowsService {
  constructor(
    private prisma: PrismaService,
    private runtime: WorkflowRuntimeService,
  ) {}

  async create(data: any) {
    return this.prisma.workflow.create({
      data: {
        name: data.name,
        description: data.description,
        graph: data.graph || { nodes: [], edges: [] },
        status: data.status || 'draft',
        projectId: data.projectId,
      },
    });
  }

  async findAll(projectId?: string) {
    return this.prisma.workflow.findMany({
      where: projectId ? { projectId } : {},
      orderBy: { updatedAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const workflow = await this.prisma.workflow.findUnique({
      where: { id },
      include: {
        executions: {
          take: 10,
          orderBy: { startTime: 'desc' },
        },
      },
    });
    if (!workflow) throw new NotFoundException(`Workflow ${id} not found`);
    return workflow;
  }

  async update(id: string, data: any) {
    return this.prisma.workflow.update({
      where: { id },
      data,
    });
  }

  async remove(id: string) {
    return this.prisma.workflow.delete({
      where: { id },
    });
  }

  async createExecution(workflowId: string, triggerSource: string, context: any) {
    const execution = await this.prisma.workflowExecution.create({
      data: {
        workflowId,
        triggerSource,
        context,
        status: 'queued',
      },
    });

    // Run in background
    this.runtime.run(execution.id).catch(err => {
      console.error(`Workflow ${workflowId} failed to run:`, err);
    });

    return execution;
  }

  async getExecution(executionId: string) {
    return this.prisma.workflowExecution.findUnique({
      where: { id: executionId },
      include: { logs: true },
    });
  }
}
