import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { EntitiesService } from './entities.service';

@Controller('entities')
export class EntitiesController {
  constructor(private readonly entitiesService: EntitiesService) {}

  @Get()
  findAll(@Query('projectId') projectId: string) {
    return this.entitiesService.findAll(projectId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.entitiesService.findOne(id);
  }

  @Post()
  create(@Body() data: { projectId: string; name: string; description?: string; fields?: any[] }) {
    return this.entitiesService.create(data.projectId, data);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() data: any) {
    return this.entitiesService.update(id, data);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.entitiesService.remove(id);
  }
}
