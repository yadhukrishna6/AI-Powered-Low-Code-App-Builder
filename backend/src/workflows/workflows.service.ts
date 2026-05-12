import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { WorkflowRuntimeService } from './runtime/workflow-runtime.service';

@Injectable()
export class WorkflowsService {
  constructor(
    private prisma: PrismaService,
    private runtime: WorkflowRuntimeService,
    private orchestrator: WorkflowOrchestrator,
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
        draftGraph: data.graph || { nodes: [], edges: [] },
        status: data.status || 'draft',
        projectId: data.projectId,
      },
    });

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
        versions: {
          orderBy: { version: 'desc' },
          take: 5,
        },
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

    if (updateData.graph) {
      updateData.draftGraph = updateData.graph;
      delete updateData.graph;
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

  async publish(id: string, metadata?: any) {
    const workflow = await this.prisma.workflow.findUnique({
      where: { id },
      include: { versions: { orderBy: { version: 'desc' }, take: 1 } },
    });

    if (!workflow || !workflow.draftGraph) {
      throw new BadRequestException('Workflow not found or has no draft to publish');
    }

    const nextVersion = workflow.versions.length > 0 ? workflow.versions[0].version + 1 : 1;

    const version = await this.prisma.workflowVersion.create({
      data: {
        workflowId: id,
        version: nextVersion,
        graph: workflow.draftGraph,
        metadata: metadata || {},
      },
    });

    await this.prisma.workflow.update({
      where: { id },
      data: {
        activeVersionId: version.id,
        status: 'active',
      },
    });

    return version;
  }

  async remove(id: string) {
    return this.prisma.workflow.delete({
      where: { id },
    });
  }

  async createExecution(workflowId: string, triggerSource: string, context: any) {
    const workflow = await this.prisma.workflow.findUnique({
      where: { id: workflowId },
      include: { versions: true }
    });

    if (!workflow) {
      throw new NotFoundException(`Workflow ${workflowId} not found`);
    }

    const versionId = workflow.activeVersionId;
    if (!versionId) {
      throw new BadRequestException(`Workflow ${workflowId} has no active version published`);
    }

    const execution = await this.prisma.workflowExecution.create({
      data: {
        workflowId,
        versionId,
        triggerSource,
        context,
        status: 'queued',
      },
    });

    // Run in background via Orchestrator
    await this.orchestrator.startExecution(execution.id);

    return execution;
  }

  async getExecution(executionId: string) {
    return this.prisma.workflowExecution.findUnique({
      where: { id: executionId },
      include: { 
        logs: true,
        version: {
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

    // Resume execution in background via Orchestrator
    const executionLogs = await this.prisma.workflowLog.findMany({
      where: { executionId, status: 'waiting' },
      orderBy: { timestamp: 'desc' },
      take: 1
    });

    if (executionLogs.length > 0) {
      await this.orchestrator.queueNode(executionId, executionLogs[0].nodeId);
    }

    return { message: 'Execution resumed' };
  }
}
