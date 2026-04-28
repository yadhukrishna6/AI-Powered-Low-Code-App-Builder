import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFormDto } from './dto/create-form.dto';
import { UpdateFormDto } from './dto/update-form.dto';

@Injectable()
export class FormsService {
  constructor(private prisma: PrismaService) {}

  async create(createFormDto: CreateFormDto) {
    return this.prisma.form.create({
      data: createFormDto,
    });
  }

  async findAll() {
    return this.prisma.form.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const form = await this.prisma.form.findUnique({
      where: { id },
    });
    if (!form) {
      throw new NotFoundException(`Form with ID "${id}" not found`);
    }
    return form;
  }

  async update(id: string, updateFormDto: UpdateFormDto) {
    try {
      return await this.prisma.form.update({
        where: { id },
        data: updateFormDto,
      });
    } catch (error) {
      throw new NotFoundException(`Form with ID "${id}" not found`);
    }
  }

  async remove(id: string) {
    try {
      await this.prisma.form.delete({
        where: { id },
      });
      return { deleted: true };
    } catch (error) {
      throw new NotFoundException(`Form with ID "${id}" not found`);
    }
  }
}
