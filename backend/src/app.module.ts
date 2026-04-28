import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { FormsModule } from './forms/forms.module';

@Module({
  imports: [PrismaModule, FormsModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
