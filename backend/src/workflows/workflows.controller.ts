import { Controller, Get, Post, Body, Put, Param, Delete, Query } from '@nestjs/common';
import { WorkflowsService } from './workflows.service';

@Controller('workflows')
export class WorkflowsController {
  constructor(private readonly workflowsService: WorkflowsService) {}

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

  @Post(':id/execute')
  execute(@Param('id') id: string, @Body() context: any) {
    return this.workflowsService.createExecution(id, 'manual', context);
  }

  @Get('executions/:id')
  getExecution(@Param('id') id: string) {
    return this.workflowsService.getExecution(id);
  }
}
