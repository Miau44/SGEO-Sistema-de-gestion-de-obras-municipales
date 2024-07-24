import { PartialType } from '@nestjs/mapped-types';
import { CreateCorrelativoMemoDto } from './create-correlativo_memo.dto';

export class UpdateCorrelativoMemoDto extends PartialType(CreateCorrelativoMemoDto) {

    
}
