import { Controller, Get, Post, Body, Put, Param, Delete, Query } from '@nestjs/common';
import { WorkflowsService } from './workflows.service';
import { AIWorkflowService } from './ai-workflow.service';

@Controller('workflows')
export class WorkflowsController {
  constructor(
    private readonly workflowsService: WorkflowsService,
    private readonly aiWorkflowService: AIWorkflowService,
  ) {}

  @Post()
  create(@Body() data: any) {
    return this.workflowsService.create(data);
  }

  @Get()
  findAll(@Query('projectId') projectId?: string) {
    return this.workflowsService.findAll(projectId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.workflowsService.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() data: any) {
    return this.workflowsService.update(id, data);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.workflowsService.remove(id);
  }

  @Post(':id/publish')
  publish(@Param('id') id: string, @Body() metadata: any) {
    return this.workflowsService.publish(id, metadata);
  }

  @Post(':id/execute')
  execute(@Param('id') id: string, @Body() context: any) {
    return this.workflowsService.createExecution(id, 'manual', context);
  }

  @Get('executions/:id')
  getExecution(@Param('id') id: string) {
    return this.workflowsService.getExecution(id);
  }

  @Post('executions/:id/resume')
  resumeExecution(@Param('id') id: string, @Body() body: { action: 'approve' | 'reject' }) {
    return this.workflowsService.resumeExecution(id, body.action);
  }

  @Post('ai/generate')
  async generateAI(@Body() body: { prompt: string }) {
    return this.aiWorkflowService.generateWorkflow(body.prompt);
  }

  @Post('test-node')
  async testNode(@Body() body: { node: any; context: any }) {
    return this.workflowsService.testNode(body.node, body.context);
  }
}
