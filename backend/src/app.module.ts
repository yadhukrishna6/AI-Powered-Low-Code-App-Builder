import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { FormsModule } from './forms/forms.module';
import { SubmissionsModule } from './submissions/submissions.module';

@Module({
  imports: [PrismaModule, FormsModule, SubmissionsModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
