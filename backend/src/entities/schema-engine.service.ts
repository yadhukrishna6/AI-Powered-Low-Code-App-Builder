import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SchemaEngineService {
  private readonly logger = new Logger(SchemaEngineService.name);

  constructor(private prisma: PrismaService) {}

  async generatePrismaSchema(projectId: string): Promise<string> {
    const entities = await this.prisma.entity.findMany({
      where: { projectId },
      include: { fields: true },
    });

    let schema = `// Generated for Project: ${projectId}\n\n`;
    
    // 1. Enums (To be added to prisma schema)
    // For now, placeholders for custom enums
    
    for (const entity of entities) {
      schema += `model ${this.capitalize(entity.name)} {\n`;
      schema += `  id String @id @default(uuid())\n`;
      
      for (const field of entity.fields) {
        if (field.name === 'id') continue;
        const type = this.mapToPrismaType(field.type);
        const modifier = field.isRequired ? '' : '?';
        const unique = field.isUnique ? ' @unique' : '';
        const defaultVal = field.defaultValue ? ` @default(${this.formatDefaultValue(field.defaultValue, field.type)})` : '';
        
        schema += `  ${field.name} ${type}${modifier}${unique}${defaultVal}\n`;
      }

      // Metadata-driven indexes and audit fields
      schema += `  createdAt DateTime @default(now())\n`;
      schema += `  updatedAt DateTime @updatedAt\n`;
      
      const eMeta = entity as any;
      if (eMeta.metadata?.indexes) {
        eMeta.metadata.indexes.forEach((idx: any) => {
          schema += `  @@index([${idx.fields.join(', ')}])\n`;
        });
      }

      schema += `}\n\n`;
    }

    return schema;
  }

  private capitalize(s: string) {
    return s.charAt(0).toUpperCase() + s.slice(1);
  }

  private mapToPrismaType(type: string): string {
    switch (type.toLowerCase()) {
      case 'text':
      case 'string': return 'String';
      case 'longtext':
      case 'richtext': return 'String'; // Prisma uses String with @db.Text for MySQL/PG usually
      case 'int':
      case 'number': return 'Int';
      case 'decimal': return 'Decimal';
      case 'boolean': return 'Boolean';
      case 'datetime': return 'DateTime';
      case 'json': return 'Json';
      case 'uuid': return 'String'; // Or @id @default(uuid())
      default: return 'String';
    }
  }

  private formatDefaultValue(val: string, type: string): string {
    if (type.toLowerCase() === 'string') return `"${val}"`;
    return val;
  }
}
