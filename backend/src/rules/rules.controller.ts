import { Controller, Get, Post, Body, Put, Param, Delete } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Controller('rules')
export class RulesController {
  constructor(private prisma: PrismaService) {}

  @Post()
  create(@Body() data: any) {
    return this.prisma.businessRule.create({
      data: {
        targetField: data.targetField,
        triggerFields: data.triggerFields || [],
        formula: data.formula,
        validation: data.validation
      }
    });
  }

  @Get()
  findAll() {
    return this.prisma.businessRule.findMany();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.prisma.businessRule.findUnique({
      where: { id }
    });
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() data: any) {
    return this.prisma.businessRule.update({
      where: { id },
      data
    });
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.prisma.businessRule.delete({
      where: { id }
    });
  }
}
