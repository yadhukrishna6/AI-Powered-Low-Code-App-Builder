import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSubmissionDto } from './dto/create-submission.dto';

@Injectable()
export class SubmissionsService {
  constructor(private prisma: PrismaService) {}

  async create(createSubmissionDto: CreateSubmissionDto) {
    // Verify form exists
    const form = await this.prisma.form.findUnique({
      where: { id: createSubmissionDto.formId },
    });

    if (!form) {
      throw new NotFoundException(`Form with ID "${createSubmissionDto.formId}" not found`);
    }

    return this.prisma.submission.create({
      data: {
        formId: createSubmissionDto.formId,
        data: createSubmissionDto.data,
      },
    });
  }

  async findByForm(formId: string) {
    const form = await this.prisma.form.findUnique({
      where: { id: formId },
    });

    if (!form) {
      throw new NotFoundException(`Form with ID "${formId}" not found`);
    }

    return this.prisma.submission.findMany({
      where: { formId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findAll() {
    return this.prisma.submission.findMany({
      orderBy: { createdAt: 'desc' },
      include: { form: true }
    });
  }

  async findOne(id: string) {
    const submission = await this.prisma.submission.findUnique({
      where: { id },
      include: { form: true },
    });

    if (!submission) {
      throw new NotFoundException(`Submission with ID "${id}" not found`);
    }

    return submission;
  }
}
