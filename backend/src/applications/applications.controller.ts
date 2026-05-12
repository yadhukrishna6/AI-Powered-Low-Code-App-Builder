import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { ApplicationsService } from './applications.service';
import { CrudGeneratorService } from './crud-generator.service';
import { AIArchitectService } from './ai-architect.service';

@Controller('applications')
export class ApplicationsController {
  constructor(
    private readonly applicationsService: ApplicationsService,
    private readonly crudGenerator: CrudGeneratorService,
    private readonly aiArchitect: AIArchitectService,
  ) {}

  @Post('generate-app')
  generateApp(@Query('projectId') projectId: string, @Body() data: { prompt: string }) {
    return this.aiArchitect.generateApplication(data.prompt);
  }

  @Post('generate-crud')
  generateCrud(@Query('projectId') projectId: string, @Body() data: { entityId: string }) {
    return this.crudGenerator.generateCrudPages(projectId, data.entityId);
  }

  @Get('layout')
  getLayout(@Query('projectId') projectId: string) {
    return this.applicationsService.getAppLayout(projectId);
  }

  @Put('layout')
  updateLayout(@Query('projectId') projectId: string, @Body() data: any) {
    return this.applicationsService.updateAppLayout(projectId, data);
  }

  @Get('pages')
  getPages(@Query('projectId') projectId: string) {
    return this.applicationsService.getPages(projectId);
  }

  @Post('pages')
  createPage(@Query('projectId') projectId: string, @Body() data: any) {
    return this.applicationsService.createPage(projectId, data);
  }

  @Put('pages/:id')
  updatePage(@Param('id') id: string, @Body() data: any) {
    return this.applicationsService.updatePage(id, data);
  }

  @Delete('pages/:id')
  removePage(@Param('id') id: string) {
    return this.applicationsService.removePage(id);
  }
}
