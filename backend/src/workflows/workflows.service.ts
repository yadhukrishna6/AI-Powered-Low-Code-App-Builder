import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { WorkflowRuntimeService } from './runtime/workflow-runtime.service';

@Injectable()
export class WorkflowsService {
  constructor(
    private prisma: PrismaService,
    private runtime: WorkflowRuntimeService,
  ) {}

  async create(data: any) {
    if (data.projectId) {
      const project = await this.prisma.project.findUnique({
        where: { id: data.projectId },
      });
      if (!project) {
        throw new NotFoundException(`Project ${data.projectId} not found`);
      }
    }

    const workflow = await this.prisma.workflow.create({
      data: {
        name: data.name,
        description: data.description,
        graph: data.graph || { nodes: [], edges: [] },
        status: data.status || 'draft',
        projectId: data.projectId,
      },
    });

    // Synchronize the internal graph ID with the actual database ID
    if (workflow.graph && typeof workflow.graph === 'object') {
      const graph = workflow.graph as any;
      graph.id = workflow.id;
      return this.prisma.workflow.update({
        where: { id: workflow.id },
        data: { graph },
      });
    }

    return workflow;
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
    const updateData = { ...data };
    delete updateData.id;

    if (updateData.projectId !== undefined && updateData.projectId !== null) {
      const project = await this.prisma.project.findUnique({
        where: { id: updateData.projectId },
      });
      if (!project) {
        throw new NotFoundException(`Project ${updateData.projectId} not found`);
      }
    }

    try {
      return await this.prisma.workflow.update({
        where: { id },
        data: updateData,
      });
    } catch (error: any) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Workflow ${id} not found`);
      }
      throw error;
    }
  }

  async remove(id: string) {
    return this.prisma.workflow.delete({
      where: { id },
    });
  }

  async createExecution(workflowId: string, triggerSource: string, context: any) {
    const workflow = await this.prisma.workflow.findUnique({
      where: { id: workflowId },
    });

    if (!workflow) {
      throw new NotFoundException(`Workflow ${workflowId} not found`);
    }

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
      include: { 
        logs: true,
        workflow: {
          select: { graph: true }
        }
      },
    });
  }

  async resumeExecution(executionId: string, action: 'approve' | 'reject') {
    const execution = await this.prisma.workflowExecution.findUnique({
      where: { id: executionId },
    });

    if (!execution) {
      throw new NotFoundException(`Execution ${executionId} not found`);
    }

    if (execution.status !== 'waiting' && execution.status !== 'running' && execution.status !== 'active') {
      throw new BadRequestException(`Cannot resume execution ${executionId}. Current status is '${execution.status}', but it must be 'waiting' or 'active'.`);
    }

    // Update execution with resume action
    await this.prisma.workflowExecution.update({
      where: { id: executionId },
      data: {
        status: 'running',
        context: {
          ...((execution.context as Record<string, any>) || {}),
          resumeAction: action,
        },
      },
    });

    // Resume execution in background
    this.runtime.resume(executionId, action).catch(err => {
      console.error(`Workflow ${execution.workflowId} resume failed:`, err);
    });

    return { message: 'Execution resumed' };
  }
}
