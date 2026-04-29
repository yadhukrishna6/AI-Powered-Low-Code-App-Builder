import { IsString, IsNotEmpty, IsObject, IsUUID } from 'class-validator';

export class CreateSubmissionDto {
  @IsUUID()
  @IsNotEmpty()
  formId: string;

  @IsObject()
  @IsNotEmpty()
  data: any;
}
