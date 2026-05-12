import { Module, Global } from '@nestjs/common';
import { CredentialsService } from './credentials.service';
import { CredentialsController } from './credentials.controller';
import { EncryptionService } from './encryption.service';
import { PrismaModule } from '../prisma/prisma.module';

@Global()
@Module({
  imports: [PrismaModule],
  controllers: [CredentialsController],
  providers: [CredentialsService, EncryptionService],
  exports: [CredentialsService],
})
export class CredentialsModule {}
