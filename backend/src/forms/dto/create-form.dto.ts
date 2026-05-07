import { IsString, IsNotEmpty, IsObject, IsOptional, IsUUID } from 'class-validator';

export class CreateFormDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsObject()
  @IsNotEmpty()
  schema: any;

  @IsUUID()
  @IsOptional()
  projectId?: string;
}
