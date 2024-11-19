import { PartialType } from "@nestjs/swagger";
import { CreateMemorandumDto } from './create-memorandum.dto';

export class UpdateMemorandumDto extends PartialType(CreateMemorandumDto) {}
