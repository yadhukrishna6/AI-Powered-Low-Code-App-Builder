import { Controller, Get, Post, Body, Param, Delete, Query } from '@nestjs/common';
import { CredentialsService } from './credentials.service';

@Controller('api/v1/credentials')
export class CredentialsController {
  constructor(private readonly credentialsService: CredentialsService) {}

  @Post()
  async create(
    @Query('orgId') orgId: string,
    @Body() body: { name: string; type: string; data: any }
  ) {
    return this.credentialsService.create(orgId, body.name, body.type, body.data);
  }

  @Get()
  async findAll(@Query('orgId') orgId: string) {
    return this.credentialsService.findAll(orgId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.credentialsService.findOne(id);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.credentialsService.remove(id);
  }
}
