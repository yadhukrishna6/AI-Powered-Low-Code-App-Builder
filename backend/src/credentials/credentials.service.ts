import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EncryptionService } from './encryption.service';

@Injectable()
export class CredentialsService {
  constructor(
    private prisma: PrismaService,
    private encryption: EncryptionService,
  ) {}

  async create(orgId: string, name: string, type: string, rawData: any) {
    const encryptedData = this.encryption.encrypt(JSON.stringify(rawData));
    
    return this.prisma.credential.create({
      data: {
        orgId,
        name,
        type,
        data: encryptedData,
      },
    });
  }

  async findAll(orgId: string) {
    const credentials = await this.prisma.credential.findMany({
      where: { orgId },
      select: {
        id: true,
        name: true,
        type: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    return credentials;
  }

  async findOne(id: string) {
    const credential = await this.prisma.credential.findUnique({
      where: { id },
    });
    
    if (!credential) throw new NotFoundException('Credential not found');
    
    return credential;
  }

  async getDecrypted(id: string) {
    const credential = await this.findOne(id);
    const decryptedData = this.encryption.decrypt(credential.data);
    return JSON.parse(decryptedData);
  }

  async remove(id: string) {
    return this.prisma.credential.delete({ where: { id } });
  }
}
